import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as runtime from '../src/runtime-gate.mjs';

const request = {
  runId: 'run-e2e-001',
  inputBindings: ['evidence:a1', 'market:p1'],
  inputs: [
    { ref: 'evidence:a1', text: 'Synthetic evidence A' },
    { ref: 'market:p1', text: 'Synthetic market prior' },
  ],
  question: 'Will the synthetic event resolve YES?',
  maxLatencyMs: 1500,
  maxCostUsd: 0.02,
  pricing: { inputUsdPerMillion: 0.2, outputUsdPerMillion: 1.2 },
};

test('exposes a verified execution orchestrator', () => {
  assert.equal(typeof runtime.executeVerifiedRun, 'function');
});

test('exposes an OpenAI Responses provider adapter', () => {
  assert.equal(typeof runtime.createOpenAIResponsesProvider, 'function');
});

test('executes, verifies and journals only sanitized run state', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'aff-journal-'));
  const journalPath = join(dir, 'runs.jsonl');
  const provider = async () => ({
    status: 'completed', latencyMs: 320, costUsd: 0.004,
    usage: { inputTokens: 120, outputTokens: 30 },
    providerResponseId: 'resp_synthetic_1',
    output: {
      decision: 'FORECAST', pYes: 0.64, uncertainty: 'MEDIUM',
      strongestLimitation: 'Synthetic fixture only',
      inputRefsUsed: ['evidence:a1', 'market:p1'],
    },
  });

  const result = await runtime.executeVerifiedRun({ request, provider, journalPath });
  assert.equal(result.verdict, 'ACCEPTED');
  assert.equal(result.providerResponseId, 'resp_synthetic_1');
  assert.deepEqual(result.usage, { inputTokens: 120, outputTokens: 30 });

  const record = JSON.parse((await readFile(journalPath, 'utf8')).trim());
  assert.equal(record.runId, 'run-e2e-001');
  assert.equal(record.verdict, 'ACCEPTED');
  assert.equal(record.providerResponseId, 'resp_synthetic_1');
  assert.equal(JSON.stringify(record).includes('Synthetic evidence A'), false);
  assert.equal(Object.hasOwn(record, 'inputs'), false);
});

test('OpenAI adapter sends strict structured output and returns bounded telemetry', async () => {
  let captured;
  const fakeFetch = async (url, options) => {
    captured = { url, options };
    return {
      ok: true,
      status: 200,
      json: async () => ({
        id: 'resp_test_1', status: 'completed',
        usage: { input_tokens: 100, output_tokens: 20 },
        output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({
          decision: 'FORECAST', pYes: 0.61, uncertainty: 'LOW',
          strongestLimitation: 'Synthetic evidence',
          inputRefsUsed: ['evidence:a1', 'market:p1'],
        }) }] }],
      }),
    };
  };

  const provider = runtime.createOpenAIResponsesProvider({
    apiKey: 'test-key', model: 'gpt-5.6-luna', fetchImpl: fakeFetch,
  });
  const response = await provider({ request });
  const body = JSON.parse(captured.options.body);
  assert.equal(captured.url, 'https://api.openai.com/v1/responses');
  assert.equal(body.store, false);
  assert.equal(body.text.format.type, 'json_schema');
  assert.equal(body.text.format.strict, true);
  assert.equal(response.providerResponseId, 'resp_test_1');
  assert.equal(response.status, 'completed');
  assert.deepEqual(response.usage, { inputTokens: 100, outputTokens: 20 });
  assert.equal(response.costUsd, 0.000044);
  assert.equal(JSON.stringify(response).includes('test-key'), false);
});

test('provider rejects an input body whose ref was not bound to the run', async () => {
  let called = false;
  const provider = runtime.createOpenAIResponsesProvider({
    apiKey: 'test-key',
    fetchImpl: async () => { called = true; throw new Error('should not call'); },
  });
  const badRequest = {
    ...request,
    inputs: [
      { ref: 'evidence:a1', text: 'Synthetic evidence A' },
      { ref: 'secret:outside-scope', text: 'Must never be sent' },
    ],
  };
  await assert.rejects(() => provider({ request: badRequest }), /UNAUTHORIZED_PROVIDER_INPUT_REF/);
  assert.equal(called, false);
});

test('provider validates pricing and request bounds before any network call', async () => {
  for (const badRequest of [
    { ...request, pricing: { inputUsdPerMillion: -1, outputUsdPerMillion: 1.2 } },
    { ...request, pricing: { inputUsdPerMillion: 0.2, outputUsdPerMillion: Number.NaN } },
    { ...request, maxLatencyMs: 0 },
    { ...request, maxCostUsd: -0.01 },
  ]) {
    let called = false;
    const provider = runtime.createOpenAIResponsesProvider({
      apiKey: 'test-key',
      fetchImpl: async () => { called = true; throw new Error('should not call'); },
    });
    await assert.rejects(() => provider({ request: badRequest }), /INVALID_NUMBER/);
    assert.equal(called, false);
  }
});

test('provider surfaces HTTP failure without returning a fluent result', async () => {
  const provider = runtime.createOpenAIResponsesProvider({
    apiKey: 'test-key',
    fetchImpl: async () => ({ ok: false, status: 429 }),
  });
  await assert.rejects(() => provider({ request }), /OPENAI_HTTP_ERROR:429/);
});

test('incomplete provider state fails closed before journal persistence', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'aff-incomplete-'));
  const journalPath = join(dir, 'runs.jsonl');
  const provider = async () => ({
    status: 'incomplete', latencyMs: 100, costUsd: 0.001,
    usage: { inputTokens: 10, outputTokens: 0 },
    providerResponseId: 'resp_incomplete_1', output: null,
  });

  await assert.rejects(
    () => runtime.executeVerifiedRun({ request, provider, journalPath }),
    /PROVIDER_NOT_COMPLETED/,
  );
  await assert.rejects(() => readFile(journalPath, 'utf8'), (error) => error?.code === 'ENOENT');
});

test('provider requires exact one-to-one coverage of bound input refs', async () => {
  let called = false;
  const provider = runtime.createOpenAIResponsesProvider({
    apiKey: 'test-key',
    fetchImpl: async () => { called = true; throw new Error('should not call'); },
  });
  const duplicateRequest = {
    ...request,
    inputs: [
      { ref: 'evidence:a1', text: 'Synthetic evidence A' },
      { ref: 'evidence:a1', text: 'Duplicate body' },
    ],
  };
  await assert.rejects(() => provider({ request: duplicateRequest }), /DUPLICATE_PROVIDER_INPUT_REF/);
  assert.equal(called, false);
});
