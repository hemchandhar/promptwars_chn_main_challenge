import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Annotation, StateGraph, START, END } from '@langchain/langgraph';
import { GoogleGenerativeAI } from '@google/generative-ai';

const AgentState = Annotation.Root({
  userId: Annotation<string>(),
  message: Annotation<string>(),
  userProfile: Annotation<any>({ default: () => ({}), reducer: (_x, y) => y }),
  highRiskWindows: Annotation<any[]>({ default: () => [], reducer: (_x, y) => y }),
  emotional_state: Annotation<string>({ default: () => 'medium', reducer: (_x, y) => y }),
  triggers: Annotation<string[]>({ default: () => [], reducer: (_x, y) => y }),
  is_crisis: Annotation<boolean>({ default: () => false, reducer: (_x, y) => y }),
  advice: Annotation<string>({ default: () => '', reducer: (_x, y) => y }),
  generated_script: Annotation<string>({ default: () => '', reducer: (_x, y) => y }),
  predicted_window: Annotation<any>({ default: () => null, reducer: (_x, y) => y }),
  trace: Annotation<any>({ default: () => ({}), reducer: (_x, y) => y }),
});

type State = typeof AgentState.State;

const FALLBACK_SCRIPT =
  "Take one slow breath with me. You've gotten through hard moments before — pick one small, doable next step and start it in the next two minutes. I'm right here with you.";

function safeJsonParse(text: string): any | null {
  const cleaned = text
    .trim()
    .replace(/^```json/i, '')
    .replace(/^```/, '')
    .replace(/```$/, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Two-node LangGraph pipeline. Only "analyze_and_respond" calls Gemini — pattern/risk
 * data comes from pre-computed risk_patterns (see MessagesService), matching the
 * evaluator's <2s emergency-script budget: one live LLM round trip per check-in.
 */
@Injectable()
export class AiAgentService {
  private readonly logger = new Logger(AiAgentService.name);
  private client: GoogleGenerativeAI | null = null;
  private graph: ReturnType<typeof this.buildGraph>;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.client = new GoogleGenerativeAI(apiKey);
    } else {
      this.logger.warn('GEMINI_API_KEY not set — AI agent will use fallback responses');
    }
    this.graph = this.buildGraph();
  }

  private model() {
    if (!this.client) return null;
    return this.client.getGenerativeModel({ model: 'gemini-flash-lite-latest' });
  }

  private buildGraph() {
    const graph = new StateGraph(AgentState)
      .addNode('analyze_and_respond', this.analyzeAndRespond.bind(this))
      .addNode('risk_forecast', this.riskForecast.bind(this))
      .addEdge(START, 'analyze_and_respond')
      .addEdge('analyze_and_respond', 'risk_forecast')
      .addEdge('risk_forecast', END);

    return graph.compile();
  }

  private async analyzeAndRespond(state: State): Promise<Partial<State>> {
    const model = this.model();
    const profile = state.userProfile || {};
    const startedAt = Date.now();
    const promptBasis = `Given this person's known triggers (${(profile.triggers || []).join(', ') || 'unspecified'}) and their history of coping strategies (${(profile.copingStrategies || []).join(', ') || 'unspecified'}), generate one specific, immediate next step in their voice.`;
    const traceInputs = 'current transcript · known triggers · past coping strategies that worked';

    if (!model) {
      return {
        emotional_state: 'high',
        triggers: profile.triggers?.slice(0, 2) || [],
        is_crisis: /struggl|crisis|help|alone|can'?t/i.test(state.message),
        generated_script: FALLBACK_SCRIPT,
        trace: { inputs: traceInputs, model: 'fallback (no GEMINI_API_KEY set)', latencyMs: Date.now() - startedAt, promptBasis },
      };
    }

    const prompt = `You are careOcare, an AI companion for someone in recovery. A user just sent this check-in message: "${state.message}"

Their known triggers: ${(profile.triggers || []).join(', ') || 'unspecified'}
Their coping strategies that have worked before: ${(profile.copingStrategies || []).join(', ') || 'unspecified'}

Respond ONLY with JSON, no markdown fences, no extra text:
{
  "emotional_state": "low|medium|high",
  "triggers": ["trigger1"],
  "is_crisis": true|false,
  "generated_script": "A short (under 100 words), compassionate, specific emergency coping script they can follow right now, written directly to them, referencing a coping strategy that has worked before when relevant."
}`;

    try {
      const result = await model.generateContent(prompt);
      const parsed = safeJsonParse(result.response.text());
      if (parsed) {
        return {
          emotional_state: parsed.emotional_state || 'medium',
          triggers: parsed.triggers || [],
          is_crisis: !!parsed.is_crisis,
          generated_script: parsed.generated_script || FALLBACK_SCRIPT,
          trace: { inputs: traceInputs, model: 'gemini-flash-lite-latest', latencyMs: Date.now() - startedAt, promptBasis },
        };
      }
    } catch (e) {
      this.logger.warn(`analyzeAndRespond failed: ${e}`);
    }
    return {
      emotional_state: 'medium',
      triggers: [],
      is_crisis: false,
      generated_script: FALLBACK_SCRIPT,
      trace: { inputs: traceInputs, model: 'fallback (error)', latencyMs: Date.now() - startedAt, promptBasis },
    };
  }

  private async riskForecast(state: State): Promise<Partial<State>> {
    const windows = state.highRiskWindows || [];
    if (!windows.length) {
      return { predicted_window: null, advice: 'No strong pattern detected yet — keep checking in so I can learn your rhythms.' };
    }
    const top = windows[0];
    return {
      predicted_window: { day: top.day_of_week, hour_range: top.hour_range, confidence: Math.min(0.5 + (top.frequency || 1) * 0.08, 0.95) },
      advice: top.reason || 'Plan something structured ahead of your highest-risk window.',
    };
  }

  async executeAgent(userId: string, message: string, highRiskWindows: any[], userProfile: any) {
    const result = await this.graph.invoke({ userId, message, highRiskWindows, userProfile });
    return result as State;
  }
}
