import { ObjectId } from 'mongodb';
import { MessagesService } from './messages.service.js';
import { makeMockMongoService } from '../test-utils/mock-mongo.js';

function makeAiAgentStub(overrides: any = {}) {
  return {
    executeAgent: jest.fn(async () => ({
      emotional_state: 'high',
      triggers: ['isolation'],
      is_crisis: false,
      advice: 'take a breath',
      generated_script: 'You are not alone.',
      predicted_window: null,
      trace: { model: 'fallback', inputs: '', latencyMs: 0, promptBasis: '' },
      ...overrides,
    })),
  };
}

describe('MessagesService', () => {
  it('getRiskCalendar returns 30 days and reflects a seeded high-risk pattern', async () => {
    const individualId = new ObjectId();
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    const mongo = makeMockMongoService({
      risk_patterns: [
        {
          userId: individualId,
          day_of_week: todayName,
          hour_range: '20-22',
          risk_level: 'high',
          reason: 'test pattern',
          frequency: 5,
          recommended_strategies: ['call a friend'],
        },
      ],
    });

    const service = new MessagesService(mongo as any, makeAiAgentStub() as any);
    const calendar = await service.getRiskCalendar(individualId.toString());

    expect(calendar).toHaveLength(30);
    const todayEntries = calendar.filter((d) => d.day === todayName);
    expect(todayEntries.some((d) => d.risk_level === 'high')).toBe(true);
  });

  it('sendMessage stores a message doc with the AI result attached', async () => {
    const userId = new ObjectId();
    const mongo = makeMockMongoService({ users: [{ _id: userId, email: 'a@b.com', triggers: [], copingStrategies: [] }] });
    const service = new MessagesService(mongo as any, makeAiAgentStub() as any);

    const result = await service.sendMessage(userId.toString(), "I'm struggling tonight");

    expect(result.generated_script).toBe('You are not alone.');
    const stored = mongo.db.collection('messages')._docs();
    expect(stored).toHaveLength(1);
    expect(stored[0].content).toBe("I'm struggling tonight");
    expect(stored[0].emotional_state).toBe('high');
  });

  it('alerts every linked caregiver when a message is flagged as a crisis', async () => {
    const individualId = new ObjectId();
    const caregiverId = new ObjectId();
    const unrelatedCaregiverId = new ObjectId();

    const mongo = makeMockMongoService({
      users: [
        { _id: individualId, email: 'person@example.com', role: 'individual', triggers: [], copingStrategies: [] },
        { _id: caregiverId, email: 'caregiver@example.com', role: 'caregiver', supportingUsers: [individualId] },
        { _id: unrelatedCaregiverId, email: 'stranger@example.com', role: 'caregiver', supportingUsers: [] },
      ],
    });
    const service = new MessagesService(mongo as any, makeAiAgentStub({ is_crisis: true }) as any);

    await service.sendMessage(individualId.toString(), 'I need help right now');

    const alerts = mongo.db.collection('caregiver_alerts')._docs();
    expect(alerts).toHaveLength(1);
    expect(alerts[0].caregiverId.toString()).toBe(caregiverId.toString());
    expect(alerts[0].alert_type).toBe('crisis');
  });

  it('does not create any alert when the message is not a crisis', async () => {
    const individualId = new ObjectId();
    const caregiverId = new ObjectId();
    const mongo = makeMockMongoService({
      users: [
        { _id: individualId, email: 'person@example.com', role: 'individual' },
        { _id: caregiverId, email: 'caregiver@example.com', role: 'caregiver', supportingUsers: [individualId] },
      ],
    });
    const service = new MessagesService(mongo as any, makeAiAgentStub({ is_crisis: false }) as any);

    await service.sendMessage(individualId.toString(), 'feeling okay today');

    expect(mongo.db.collection('caregiver_alerts')._docs()).toHaveLength(0);
  });

  it('recomputes risk_patterns from real message history after sending', async () => {
    const individualId = new ObjectId();
    const mongo = makeMockMongoService({ users: [{ _id: individualId, email: 'p@example.com', copingStrategies: ['walk'] }] });
    const service = new MessagesService(mongo as any, makeAiAgentStub({ emotional_state: 'high' }) as any);

    await service.sendMessage(individualId.toString(), 'message one');
    await service.sendMessage(individualId.toString(), 'message two');

    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const patterns = mongo.db.collection('risk_patterns')._docs();
    const todayPattern = patterns.find((p: any) => p.day_of_week === todayName);
    expect(todayPattern).toBeDefined();
    expect(todayPattern.risk_level).toBe('high');
    expect(todayPattern.recommended_strategies).toContain('walk');
  });
});
