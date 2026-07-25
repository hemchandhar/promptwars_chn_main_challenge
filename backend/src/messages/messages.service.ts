import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { MongoService } from '../common/mongo.service.js';
import { AiAgentService } from '../ai-agent/ai-agent.service.js';

const DEFAULT_SUGGESTIONS: Record<string, string[]> = {
  high: ['Structured activity in the risk window (this worked before)', 'Text a friend before the window starts to lock in plans', 'Physical activity — a walk or workout has broken the pattern before'],
  medium: ['Plan the evening ahead of time', 'Check in with your support contact'],
  low: ['No preparation needed — maintain your routine'],
};

@Injectable()
export class MessagesService {
  constructor(
    private mongo: MongoService,
    private aiAgent: AiAgentService,
  ) {}

  private get messages() {
    return this.mongo.db.collection('messages');
  }
  private get users() {
    return this.mongo.db.collection('users');
  }
  private get riskPatterns() {
    return this.mongo.db.collection('risk_patterns');
  }
  private get trainingLog() {
    return this.mongo.db.collection('ai_training_log');
  }
  private get alerts() {
    return this.mongo.db.collection('caregiver_alerts');
  }

  async sendMessage(userId: string, message: string) {
    const user = await this.users.findOne({ _id: new ObjectId(userId) });
    const patterns = await this.riskPatterns
      .find({ userId: new ObjectId(userId) })
      .sort({ risk_level: -1, frequency: -1 })
      .toArray();

    const result = await this.aiAgent.executeAgent(userId, message, patterns, {
      triggers: user?.triggers || [],
      copingStrategies: user?.copingStrategies || [],
    });

    const now = new Date();
    await this.messages.insertOne({
      userId: new ObjectId(userId),
      content: message,
      timestamp: now,
      emotional_state: result.emotional_state,
      triggers_detected: result.triggers,
      day_of_week: now.toLocaleDateString('en-US', { weekday: 'long' }),
      hour_of_day: now.getHours(),
      generated_script: result.generated_script || null,
      script_generated_at: result.generated_script ? now : null,
    });

    await this.bumpTrainingDay(userId, now);
    await this.recomputeRiskPatterns(userId, user?.copingStrategies || []);

    if (result.is_crisis) {
      await this.alertCaregiversOfCrisis(userId, user?.email || 'This person');
    }

    return {
      emotional_state: result.emotional_state,
      triggers_detected: result.triggers,
      is_crisis: result.is_crisis,
      advice: result.advice,
      generated_script: result.generated_script,
      predicted_window: result.predicted_window,
      trace: result.trace,
    };
  }

  /**
   * Recomputes risk_patterns for a user directly from their real message history —
   * no seed data required. Runs after every check-in so the calendar/forecast stay live.
   */
  private async recomputeRiskPatterns(userId: string, copingStrategies: string[]) {
    const _id = new ObjectId(userId);
    const history = await this.messages.find({ userId: _id }).sort({ timestamp: -1 }).limit(200).toArray();
    if (history.length === 0) return;

    const byDay = new Map<string, typeof history>();
    for (const m of history) {
      const key = m.day_of_week;
      if (!key) continue;
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key)!.push(m);
    }

    for (const [dayOfWeek, msgs] of byDay) {
      const highCount = msgs.filter((m) => m.emotional_state === 'high').length;
      const ratio = highCount / msgs.length;
      const riskLevel: 'high' | 'medium' | 'low' = ratio >= 0.5 && msgs.length >= 2 ? 'high' : ratio >= 0.25 || (highCount >= 1 && msgs.length >= 2) ? 'medium' : 'low';

      const hourCounts = new Map<number, number>();
      for (const m of msgs) hourCounts.set(m.hour_of_day, (hourCounts.get(m.hour_of_day) || 0) + 1);
      const modalHour = [...hourCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 20;
      const hourRange = `${modalHour}-${(modalHour + 2) % 24}`;

      const topTriggers = [...new Set(msgs.flatMap((m) => m.triggers_detected || []))].slice(0, 2);
      const reason = riskLevel === 'low'
        ? `${msgs.length} check-in${msgs.length === 1 ? '' : 's'} logged on ${dayOfWeek}s — no strong pattern yet.`
        : `You reported a high-stress state in ${highCount} of your last ${msgs.length} ${dayOfWeek} check-ins${topTriggers.length ? `, most often citing ${topTriggers.join(' and ')}` : ''}, concentrated around ${modalHour}:00.`;

      await this.riskPatterns.updateOne(
        { userId: _id, day_of_week: dayOfWeek },
        {
          $set: {
            userId: _id,
            day_of_week: dayOfWeek,
            hour_range: hourRange,
            risk_level: riskLevel,
            reason,
            frequency: highCount,
            recommended_strategies: copingStrategies.length ? copingStrategies.slice(0, 3) : DEFAULT_SUGGESTIONS[riskLevel],
            updated_at: new Date(),
          },
        },
        { upsert: true },
      );
    }
  }

  private async alertCaregiversOfCrisis(individualId: string, individualEmail: string) {
    const caregivers = await this.users.find({ role: 'caregiver', supportingUsers: new ObjectId(individualId) }).toArray();
    if (!caregivers.length) return;

    const now = new Date();
    await this.alerts.insertMany(
      caregivers.map((c) => ({
        caregiverId: c._id,
        individualId: new ObjectId(individualId),
        alert_type: 'crisis',
        message: `${individualEmail.split('@')[0]} may be in crisis — they just reached out to careOcare for immediate help.`,
        read: false,
        created_at: now,
      })),
    );
  }

  private async bumpTrainingDay(userId: string, now: Date) {
    const _id = new ObjectId(userId);
    const user = await this.users.findOne({ _id });
    const day = Math.min((user?.aiTrainingDay || 1) + 1, 30);
    await this.users.updateOne({ _id }, { $set: { aiTrainingDay: day, updatedAt: now } });

    const messagesAnalyzed = await this.messages.countDocuments({ userId: _id });
    const patternsDetected = await this.riskPatterns.countDocuments({ userId: _id });
    await this.trainingLog.updateOne(
      { userId: _id },
      {
        $set: {
          day_number: day,
          messages_analyzed: messagesAnalyzed,
          patterns_detected: patternsDetected,
          personalization_score: Math.min(Math.round((day / 30) * 100), 100),
          date: new Date(),
        },
      },
      { upsert: true },
    );
  }

  async getMessageHistory(userId: string, days: number) {
    const since = new Date(Date.now() - days * 86400000);
    return this.messages
      .find({ userId: new ObjectId(userId), timestamp: { $gte: since } })
      .sort({ timestamp: -1 })
      .toArray();
  }

  async getRiskPatterns(userId: string) {
    return this.riskPatterns.find({ userId: new ObjectId(userId) }).toArray();
  }

  async getRiskCalendar(userId: string) {
    const patterns = await this.getRiskPatterns(userId);
    const calendar: any[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      const dayPatterns = patterns.filter((p) => p.day_of_week === dayOfWeek);
      const top = dayPatterns[0];
      const riskLevel = top?.risk_level || 'low';

      calendar.push({
        date: date.getDate(),
        day: dayOfWeek,
        risk_level: riskLevel,
        reason: top?.reason || 'No detected patterns',
        accuracy: top ? `${Math.min(50 + (top.frequency || 1) * 7, 92)}%` : '—',
        multiplier: riskLevel === 'high' ? '+300%' : riskLevel === 'medium' ? '+140%' : 'baseline',
        suggestions: top?.recommended_strategies?.length ? top.recommended_strategies : DEFAULT_SUGGESTIONS[riskLevel],
      });
    }
    return calendar;
  }

  async getAiProgress(userId: string) {
    const user = await this.users.findOne({ _id: new ObjectId(userId) });
    const log = await this.trainingLog.findOne({ userId: new ObjectId(userId) });

    return {
      training_day: user?.aiTrainingDay || 1,
      personalization_score: log?.personalization_score ?? 0,
      patterns_detected: log?.patterns_detected ?? 0,
      messages_analyzed: log?.messages_analyzed ?? 0,
    };
  }
}
