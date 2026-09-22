import test from 'node:test';
import assert from 'node:assert/strict';
import { createOpenAIResponsesProvider } from '../src/runtime-gate.mjs';

const request = {
  runId: 'run-provider-latency-001',
  inputBindings: ['evidence:a1'],
  inputs: [{ ref: 'evidence:a1', text: 'Synthetic evidence A' }],
  question: 'Will the synthetic event resolve YES?',
  maxLatencyMs: 1500,
  maxCostUsd: 0.02,
  pricing: { inputUsdPerMillion: 0.2, outputUsdPerMillion: 1.2 },
};

test('OpenAI adapter latency includes response body consumption', async () => {
  let nowMs = 1_000;
  const provider = createOpenAIResponsesProvider({
    apiKey: 'test-key',
    now: () => nowMs,
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      json: async () => {
        nowMs += 75;
        return {
          id: 'resp_delayed_body', status: 'completed',
          usage: { input_tokens: 100, output_tokens: 20 },
          output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({
            decision: 'FORECAST', pYes: 0.61, uncertainty: 'LOW',
            strongestLimitation: 'Synthetic evidence', inputRefsUsed: ['evidence:a1'],
          }) }] }],
        };
      },
    }),
  });

  const response = await provider({ request });
  assert.equal(response.latencyMs, 75);
});
