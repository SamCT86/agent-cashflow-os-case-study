import { appendFile, open, readFile, stat, unlink } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';

const allowedDecisions = new Set(['FORECAST', 'NO_EDGE', 'MARKET_PRIOR_ADEQUATE', 'INSUFFICIENT_EVIDENCE', 'UNSUPPORTED', 'ABSTAIN']);
const abstainingDecisions = new Set(['ABSTAIN', 'INSUFFICIENT_EVIDENCE', 'UNSUPPORTED']);
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
  if (!abstainingDecisions.has(output.decision) && output.inputRefsUsed.length === 0) fail('EVIDENCE_REF_REQUIRED');

  const allowedRefs = new Set(inputBindings);
  for (const ref of output.inputRefsUsed) {
    nonEmptyString(ref, 'inputRefsUsed');
    if (!allowedRefs.has(ref)) fail('UNAUTHORIZED_INPUT_REF', ref);
  }

  if (output.decision === 'FORECAST') {
    finiteNumber(output.pYes, 'pYes', 0, 1);
  } else if (abstainingDecisions.has(output.decision)) {
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
    verdict: abstainingDecisions.has(response.output.decision) ? 'ABSTAINED' : 'ACCEPTED',
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

function sanitizeUsage(usage) {
  if (usage == null) return null;
  return Object.freeze({
    inputTokens: finiteNumber(usage.inputTokens, 'inputTokens', 0),
    outputTokens: finiteNumber(usage.outputTokens, 'outputTokens', 0),
  });
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

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
}

function fingerprintRequest(request) {
  return createHash('sha256').update(JSON.stringify(canonicalize(request))).digest('hex');
}

async function readPersistedRun(journalPath, runId) {
  let raw;
  try {
    raw = await readFile(journalPath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }

  let match = null;
  for (const line of raw.split('\n')) {
    if (line.trim() === '') continue;
    let record;
    try {
      record = JSON.parse(line);
    } catch {
      fail('INVALID_JOURNAL_RECORD');
    }
    if (record?.runId === runId) match = record;
  }
  return match;
}

function claimPathFor(journalPath, runId) {
  const digest = createHash('sha256').update(runId).digest('hex');
  return `${journalPath}.${digest}.claim`;
}

function replayPersisted(persisted, requestFingerprint, runId) {
  if (typeof persisted.requestFingerprint !== 'string') fail('IDEMPOTENCY_STATE_UNVERIFIABLE', runId);
  if (persisted.requestFingerprint !== requestFingerprint) fail('IDEMPOTENCY_KEY_CONFLICT', runId);
  return Object.freeze({ ...persisted });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function unlinkIfExists(path) {
  try {
    await unlink(path);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

async function acquireRunClaim({ journalPath, runId, requestFingerprint, claimTtlMs }) {
  const claimPath = claimPathFor(journalPath, runId);
  const ownerToken = randomUUID();

  while (true) {
    let handle;
    try {
      handle = await open(claimPath, 'wx', 0o600);
      await handle.writeFile(`${JSON.stringify({ schemaVersion: 1, ownerToken, requestFingerprint })}\n`, 'utf8');
      await handle.close();
      return { claimPath, ownerToken };
    } catch (error) {
      if (handle) {
        try { await handle.close(); } catch {}
        await unlinkIfExists(claimPath);
      }
      if (error?.code !== 'EEXIST') throw error;
    }

    let metadata;
    try {
      metadata = await stat(claimPath);
    } catch (error) {
      if (error?.code === 'ENOENT') continue;
      throw error;
    }

    let activeClaim;
    try {
      activeClaim = JSON.parse(await readFile(claimPath, 'utf8'));
      if (typeof activeClaim?.requestFingerprint === 'string' && activeClaim.requestFingerprint !== requestFingerprint) {
        fail('IDEMPOTENCY_KEY_CONFLICT', runId);
      }
    } catch (error) {
      if (error instanceof SyntaxError || error?.code === 'ENOENT') {
        if (Date.now() - metadata.mtimeMs > claimTtlMs) {
          await unlinkIfExists(claimPath);
          continue;
        }
        await sleep(10);
        continue;
      }
      throw error;
    }

    if (Date.now() - metadata.mtimeMs > claimTtlMs) {
      await unlinkIfExists(claimPath);
      continue;
    }

    await sleep(10);
  }
}

async function releaseRunClaim({ claimPath, ownerToken }) {
  let activeClaim;
  try {
    activeClaim = JSON.parse(await readFile(claimPath, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return;
    if (error instanceof SyntaxError) return;
    throw error;
  }
  if (activeClaim?.ownerToken === ownerToken) await unlinkIfExists(claimPath);
}

export async function executeVerifiedRun({ request, provider, journalPath } = {}) {
  if (typeof provider !== 'function') fail('PROVIDER_REQUIRED');
  nonEmptyString(journalPath, 'journalPath');
  if (!request || typeof request !== 'object' || Array.isArray(request)) fail('INVALID_REQUEST');

  const runId = nonEmptyString(request.runId, 'runId');
  const requestFingerprint = fingerprintRequest(request);
  const persisted = await readPersistedRun(journalPath, runId);
  if (persisted) return replayPersisted(persisted, requestFingerprint, runId);

  const declaredMaxLatencyMs = typeof request.maxLatencyMs === 'number' && Number.isFinite(request.maxLatencyMs)
    ? Math.max(0, request.maxLatencyMs)
    : 0;
  const claimTtlMs = Math.max(30_000, declaredMaxLatencyMs + 5_000);
  const claim = await acquireRunClaim({ journalPath, runId, requestFingerprint, claimTtlMs });

  try {
    const persistedAfterClaim = await readPersistedRun(journalPath, runId);
    if (persistedAfterClaim) return replayPersisted(persistedAfterClaim, requestFingerprint, runId);

    const response = await provider({ request });
    const verdict = evaluateBoundedAgentRun({ request, response });
    const record = Object.freeze({
      schemaVersion: 2,
      runId: verdict.runId,
      requestFingerprint,
      verdict: verdict.verdict,
      decision: verdict.decision,
      pYes: verdict.pYes,
      uncertainty: response.output.uncertainty,
      strongestLimitation: response.output.strongestLimitation,
      inputRefsUsed: [...response.output.inputRefsUsed],
      providerResponseId: response.providerResponseId ?? null,
      usage: sanitizeUsage(response.usage),
      costUsd: response.costUsd,
      latencyMs: response.latencyMs,
      createdAt: new Date().toISOString(),
    });

    await appendFile(journalPath, `${JSON.stringify(record)}\n`, 'utf8');
    return record;
  } finally {
    await releaseRunClaim(claim);
  }
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
