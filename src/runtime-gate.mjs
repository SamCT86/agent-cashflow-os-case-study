import { appendFile } from 'node:fs/promises';

const allowedDecisions = new Set(['FORECAST', 'NO_EDGE', 'MARKET_PRIOR_ADEQUATE', 'INSUFFICIENT_EVIDENCE', 'UNSUPPORTED', 'ABSTAIN']);
const allowedUncertainty = new Set(['LOW', 'MEDIUM', 'HIGH']);
const forbiddenPersistenceFields = new Set(['hiddenReasoning', 'chainOfThought', 'apiKey', 'authorization']);

function fail(code, detail = '') {
  throw new Error(detail ? `${code}:${detail}` : code);
}

function finiteNumber(value, field, min = 0, max = Number.MAX_VALUE) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    fail('INVALID_NUMBER', field);
  }
  return value;
}

function nonEmptyString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') fail('INVALID_STRING', field);
  return value;
}

function validatePersistenceSurface(response) {
  for (const key of forbiddenPersistenceFields) {
    if (Object.hasOwn(response, key)) fail('FORBIDDEN_PERSISTENCE_FIELD', key);
  }
}
function validateOutput(output, inputBindings) {
  if (!output || typeof output !== 'object' || Array.isArray(output)) fail('INVALID_OUTPUT');
  if (!allowedDecisions.has(output.decision)) fail('INVALID_DECISION');
  if (!allowedUncertainty.has(output.uncertainty)) fail('INVALID_UNCERTAINTY');
  nonEmptyString(output.strongestLimitation, 'strongestLimitation');
  if (!Array.isArray(output.inputRefsUsed)) fail('INVALID_INPUT_REFS');

  const allowedRefs = new Set(inputBindings);
  for (const ref of output.inputRefsUsed) {
    nonEmptyString(ref, 'inputRefsUsed');
    if (!allowedRefs.has(ref)) fail('UNAUTHORIZED_INPUT_REF', ref);
  }

  if (output.decision === 'FORECAST') {
    finiteNumber(output.pYes, 'pYes', 0, 1);
  } else if (output.decision === 'ABSTAIN' || output.decision === 'INSUFFICIENT_EVIDENCE' || output.decision === 'UNSUPPORTED') {
    if (output.pYes !== null) fail('NON_FORECAST_PROBABILITY_FORBIDDEN');
  } else if (output.pYes !== null) {
    finiteNumber(output.pYes, 'pYes', 0, 1);
  }
}

export function evaluateBoundedAgentRun(run) {
  if (!run || typeof run !== 'object') fail('INVALID_RUN');
  const { request, response } = run;
  if (!request || !response) fail('REQUEST_RESPONSE_REQUIRED');
  const runId = nonEmptyString(request.runId, 'runId');
  if (!Array.isArray(request.inputBindings) || request.inputBindings.length === 0) fail('INPUT_BINDINGS_REQUIRED');
  if (new Set(request.inputBindings).size !== request.inputBindings.length) fail('DUPLICATE_INPUT_BINDING');
  request.inputBindings.forEach((ref) => nonEmptyString(ref, 'inputBindings'));

  const maxLatencyMs = finiteNumber(request.maxLatencyMs, 'maxLatencyMs', 1);
  const maxCostUsd = finiteNumber(request.maxCostUsd, 'maxCostUsd', 0);

  validatePersistenceSurface(response);
  if (response.status !== 'completed') fail('PROVIDER_NOT_COMPLETED');
  const latencyMs = finiteNumber(response.latencyMs, 'latencyMs', 0);
  const costUsd = finiteNumber(response.costUsd, 'costUsd', 0);
  if (latencyMs > maxLatencyMs) fail('LATENCY_BOUND_EXCEEDED');
  if (costUsd > maxCostUsd) fail('COST_BOUND_EXCEEDED');

  validateOutput(response.output, request.inputBindings);

  return Object.freeze({
    verdict: response.output.decision === 'ABSTAIN' ? 'ABSTAINED' : 'ACCEPTED',
    runId,
    decision: response.output.decision,
    pYes: response.output.pYes,
  });
}

function estimateCostUsd(usage, pricing) {
  const inputTokens = finiteNumber(usage?.inputTokens, 'inputTokens', 0);
  const outputTokens = finiteNumber(usage?.outputTokens, 'outputTokens', 0);
  const inputRate = finiteNumber(pricing?.inputUsdPerMillion, 'inputUsdPerMillion', 0);
  const outputRate = finiteNumber(pricing?.outputUsdPerMillion, 'outputUsdPerMillion', 0);
  const cost = (inputTokens * inputRate + outputTokens * outputRate) / 1_000_000;
  return Number(cost.toFixed(9));
}

function extractOutputText(data) {
  const message = data?.output?.find((item) => item?.type === 'message');
  const outputText = message?.content?.find((item) => item?.type === 'output_text')?.text;
  return nonEmptyString(outputText, 'providerOutputText');
}

function validateProviderInputs(request) {
  nonEmptyString(request.question, 'question');
  if (!Array.isArray(request.inputs) || request.inputs.length === 0) fail('PROVIDER_INPUTS_REQUIRED');
  if (request.inputs.length !== request.inputBindings.length) fail('PROVIDER_INPUT_BINDING_MISMATCH');
  const allowed = new Set(request.inputBindings);
  const seen = new Set();
  for (const input of request.inputs) {
    nonEmptyString(input?.ref, 'input.ref');
    nonEmptyString(input?.text, 'input.text');
    if (seen.has(input.ref)) fail('DUPLICATE_PROVIDER_INPUT_REF', input.ref);
    seen.add(input.ref);
    if (!allowed.has(input.ref)) fail('UNAUTHORIZED_PROVIDER_INPUT_REF', input.ref);
  }
}

const forecastSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    decision: { type: 'string', enum: [...allowedDecisions] },
    pYes: { type: ['number', 'null'] },
    uncertainty: { type: 'string', enum: [...allowedUncertainty] },
    strongestLimitation: { type: 'string' },
    inputRefsUsed: { type: 'array', items: { type: 'string' } },
  },
  required: ['decision', 'pYes', 'uncertainty', 'strongestLimitation', 'inputRefsUsed'],
};

export function createOpenAIResponsesProvider({
  apiKey,
  model = 'gpt-5.6-luna',
  fetchImpl = globalThis.fetch,
  endpoint = 'https://api.openai.com/v1/responses',
  now = () => Date.now(),
} = {}) {
  nonEmptyString(apiKey, 'apiKey');
  nonEmptyString(model, 'model');
  if (typeof fetchImpl !== 'function') fail('FETCH_REQUIRED');

  return async ({ request }) => {
    validateProviderInputs(request);
    const startedAt = now();
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(request.maxLatencyMs),
      body: JSON.stringify({
        model,
        store: false,
        input: [
          {
            role: 'system',
            content: 'Return a bounded forecast decision using only the provided input refs. Preserve abstention when evidence is insufficient.',
          },
          {
            role: 'user',
            content: JSON.stringify({ question: request.question, inputs: request.inputs }),
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'forecast_decision',
            strict: true,
            schema: forecastSchema,
          },
        },
      }),
    });

    const latencyMs = Math.max(0, now() - startedAt);
    if (!response?.ok) fail('OPENAI_HTTP_ERROR', String(response?.status ?? 'unknown'));
    const data = await response.json();
    const usage = {
      inputTokens: finiteNumber(data?.usage?.input_tokens, 'inputTokens', 0),
      outputTokens: finiteNumber(data?.usage?.output_tokens, 'outputTokens', 0),
    };
    let output = null;
    if (data.status === 'completed') {
      try {
        output = JSON.parse(extractOutputText(data));
      } catch (error) {
        fail('INVALID_STRUCTURED_OUTPUT', error instanceof Error ? error.message : 'parse');
      }
    }

    return {
      status: data.status,
      latencyMs,
      costUsd: estimateCostUsd(usage, request.pricing),
      usage,
      providerResponseId: nonEmptyString(data.id, 'providerResponseId'),
      output,
    };
  };
}

export async function executeVerifiedRun({ request, provider, journalPath } = {}) {
  if (typeof provider !== 'function') fail('PROVIDER_REQUIRED');
  nonEmptyString(journalPath, 'journalPath');

  const response = await provider({ request });
  const verdict = evaluateBoundedAgentRun({ request, response });
  const record = Object.freeze({
    schemaVersion: 1,
    runId: verdict.runId,
    verdict: verdict.verdict,
    decision: verdict.decision,
    pYes: verdict.pYes,
    uncertainty: response.output.uncertainty,
    strongestLimitation: response.output.strongestLimitation,
    inputRefsUsed: [...response.output.inputRefsUsed],
    providerResponseId: response.providerResponseId ?? null,
    usage: response.usage ?? null,
    costUsd: response.costUsd,
    latencyMs: response.latencyMs,
    createdAt: new Date().toISOString(),
  });

  await appendFile(journalPath, `${JSON.stringify(record)}\n`, 'utf8');
  return record;
}

export function evaluateFixtureSet(fixtures) {
  if (!Array.isArray(fixtures)) fail('EVAL_FIXTURES_REQUIRED');
  const cases = fixtures.map((fixture) => {
    nonEmptyString(fixture?.name, 'fixture.name');
    try {
      const result = evaluateBoundedAgentRun(fixture.run);
      const passed = fixture.expectedVerdict === result.verdict && !fixture.expectedError;
      return { name: fixture.name, passed, observed: result.verdict, expected: fixture.expectedVerdict ?? fixture.expectedError };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const passed = typeof fixture.expectedError === 'string' && message.startsWith(fixture.expectedError);
      return { name: fixture.name, passed, observed: message, expected: fixture.expectedError ?? fixture.expectedVerdict };
    }
  });
  const passed = cases.filter((item) => item.passed).length;
  return Object.freeze({
    total: cases.length,
    passed,
    failed: cases.length - passed,
    cases,
  });
}
