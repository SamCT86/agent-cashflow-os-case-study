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
