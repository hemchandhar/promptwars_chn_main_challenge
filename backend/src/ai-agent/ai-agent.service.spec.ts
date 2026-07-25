import { ConfigService } from '@nestjs/config';
import { AiAgentService } from './ai-agent.service.js';

function makeService() {
  // No GEMINI_API_KEY configured -> deterministic fallback path, no network calls.
  const config = { get: () => undefined } as unknown as ConfigService;
  return new AiAgentService(config);
}

describe('AiAgentService (fallback path, no API key)', () => {
  it('always returns a usable generated_script even without a live model', async () => {
    const service = makeService();
    const result = await service.executeAgent('user1', 'just checking in', [], { triggers: [], copingStrategies: [] });
    expect(result.generated_script).toBeTruthy();
    expect(result.trace.model).toContain('fallback');
  });

  it('flags crisis language heuristically when no model is available', async () => {
    const service = makeService();
    const result = await service.executeAgent('user1', "I can't do this anymore, I need help", [], {});
    expect(result.is_crisis).toBe(true);
  });

  it('does not flag a neutral check-in as crisis', async () => {
    const service = makeService();
    const result = await service.executeAgent('user1', 'Had a good day today', [], {});
    expect(result.is_crisis).toBe(false);
  });

  it('derives predicted_window from the strongest known risk pattern', async () => {
    const service = makeService();
    const highRiskWindows = [
      { day_of_week: 'Friday', hour_range: '20-22', frequency: 4, reason: 'isolation on Fridays' },
      { day_of_week: 'Thursday', hour_range: '18-20', frequency: 1, reason: 'minor dip' },
    ];
    const result = await service.executeAgent('user1', 'hello', highRiskWindows, {});
    expect(result.predicted_window).toEqual(
      expect.objectContaining({ day: 'Friday', hour_range: '20-22' }),
    );
    expect(result.advice).toBe('isolation on Fridays');
  });

  it('returns no predicted_window when there is no pattern history yet', async () => {
    const service = makeService();
    const result = await service.executeAgent('user1', 'hello', [], {});
    expect(result.predicted_window).toBeNull();
  });
});
