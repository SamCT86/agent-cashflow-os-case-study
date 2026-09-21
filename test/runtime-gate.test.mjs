import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateBoundedAgentRun } from '../src/runtime-gate.mjs';

const base = {
  request: {
    runId: 'run-001',
    inputBindings: ['evidence:a1', 'market:p1'],
    maxLatencyMs: 1500,
    maxCostUsd: 0.02,
  },
  response: {
    status: 'completed',
    latencyMs: 420,
    costUsd: 0.0042,
    output: {
      decision: 'FORECAST',
      pYes: 0.63,
      uncertainty: 'MEDIUM',
      strongestLimitation: 'Sparse comparable history',
      inputRefsUsed: ['evidence:a1', 'market:p1'],
    },
  },
};

test('accepts a bounded response that only cites authorized inputs', () => {
  const result = evaluateBoundedAgentRun(base);
  assert.deepEqual(result, {
    verdict: 'ACCEPTED',
    runId: 'run-001',
    decision: 'FORECAST',
    pYes: 0.63,
  });
});

test('fails closed when output cites an input that was not bound to the run', () => {
  assert.throws(
    () => evaluateBoundedAgentRun({
      ...base,
      response: {
        ...base.response,
        output: { ...base.response.output, inputRefsUsed: ['evidence:a1', 'secret:outside-scope'] },
      },
    }),
    /UNAUTHORIZED_INPUT_REF/,
  );
});

test('fails closed when latency or cost exceed their predeclared bounds', () => {
  assert.throws(
    () => evaluateBoundedAgentRun({ ...base, response: { ...base.response, latencyMs: 2000 } }),
    /LATENCY_BOUND_EXCEEDED/,
  );
  assert.throws(
    () => evaluateBoundedAgentRun({ ...base, response: { ...base.response, costUsd: 0.2 } }),
    /COST_BOUND_EXCEEDED/,
  );
});

test('preserves abstention instead of manufacturing a probability', () => {
  const result = evaluateBoundedAgentRun({
    ...base,
    response: {
      ...base.response,
      output: {
        decision: 'ABSTAIN',
        pYes: null,
        uncertainty: 'HIGH',
        strongestLimitation: 'Evidence conflict remains unresolved',
        inputRefsUsed: ['evidence:a1'],
      },
    },
  });
  assert.deepEqual(result, { verdict: 'ABSTAINED', runId: 'run-001', decision: 'ABSTAIN', pYes: null });
});

test('treats insufficient-evidence and unsupported decisions as abstained', () => {
  for (const decision of ['INSUFFICIENT_EVIDENCE', 'UNSUPPORTED']) {
    const result = evaluateBoundedAgentRun({
      ...base,
      request: { ...base.request, runId: `run-${decision.toLowerCase()}` },
      response: {
        ...base.response,
        output: {
          decision,
          pYes: null,
          uncertainty: 'HIGH',
          strongestLimitation: 'The requested decision is not supportable from the bound evidence',
          inputRefsUsed: ['evidence:a1'],
        },
      },
    });
    assert.equal(result.verdict, 'ABSTAINED');
    assert.equal(result.decision, decision);
    assert.equal(result.pYes, null);
  }
});

test('rejects hidden reasoning or raw secret persistence fields', () => {
  assert.throws(
    () => evaluateBoundedAgentRun({
      ...base,
      response: { ...base.response, hiddenReasoning: 'private chain', apiKey: 'example-redacted-key' },
    }),
    /FORBIDDEN_PERSISTENCE_FIELD/,
  );
});
