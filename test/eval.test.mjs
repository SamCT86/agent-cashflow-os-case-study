import test from 'node:test';
import assert from 'node:assert/strict';
import * as runtime from '../src/runtime-gate.mjs';

const baseRequest = {
  runId: 'eval-1', inputBindings: ['evidence:a1'],
  maxLatencyMs: 1000, maxCostUsd: 0.01,
};
const acceptedResponse = {
  status: 'completed', latencyMs: 100, costUsd: 0.001,
  output: {
    decision: 'FORECAST', pYes: 0.7, uncertainty: 'MEDIUM',
    strongestLimitation: 'Synthetic fixture', inputRefsUsed: ['evidence:a1'],
  },
};

test('offline eval reports expected verdicts and expected failures', () => {
  assert.equal(typeof runtime.evaluateFixtureSet, 'function');
  const report = runtime.evaluateFixtureSet([
    { name: 'accepted', run: { request: baseRequest, response: acceptedResponse }, expectedVerdict: 'ACCEPTED' },
    { name: 'rejects unbound ref', run: { request: baseRequest, response: { ...acceptedResponse, output: { ...acceptedResponse.output, inputRefsUsed: ['outside'] } } }, expectedError: 'UNAUTHORIZED_INPUT_REF' },
  ]);
  assert.equal(report.total, 2);
  assert.equal(report.passed, 2);
  assert.equal(report.failed, 0);
});
