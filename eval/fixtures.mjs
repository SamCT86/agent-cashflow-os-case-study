const request = {
  runId: 'eval-base',
  inputBindings: ['evidence:a1'],
  maxLatencyMs: 1000,
  maxCostUsd: 0.01,
};

const response = {
  status: 'completed',
  latencyMs: 120,
  costUsd: 0.001,
  output: {
    decision: 'FORECAST',
    pYes: 0.68,
    uncertainty: 'MEDIUM',
    strongestLimitation: 'Synthetic fixture only',
    inputRefsUsed: ['evidence:a1'],
  },
};

export const fixtures = [
  {
    name: 'bounded forecast accepted',
    run: { request, response },
    expectedVerdict: 'ACCEPTED',
  },
  {
    name: 'abstention preserved',
    run: {
      request: { ...request, runId: 'eval-abstain' },
      response: {
        ...response,
        output: {
          decision: 'ABSTAIN', pYes: null, uncertainty: 'HIGH',
          strongestLimitation: 'Conflicting synthetic evidence',
          inputRefsUsed: ['evidence:a1'],
        },
      },
    },
    expectedVerdict: 'ABSTAINED',
  },
  {
    name: 'insufficient evidence abstains',
    run: {
      request: { ...request, runId: 'eval-insufficient' },
      response: {
        ...response,
        output: {
          decision: 'INSUFFICIENT_EVIDENCE', pYes: null, uncertainty: 'HIGH',
          strongestLimitation: 'Synthetic evidence is insufficient',
          inputRefsUsed: ['evidence:a1'],
        },
      },
    },
    expectedVerdict: 'ABSTAINED',
  },
  {
    name: 'unbound reference rejected',
    run: {
      request: { ...request, runId: 'eval-unbound' },
      response: { ...response, output: { ...response.output, inputRefsUsed: ['outside'] } },
    },
    expectedError: 'UNAUTHORIZED_INPUT_REF',
  },
  {
    name: 'incomplete provider state rejected',
    run: {
      request: { ...request, runId: 'eval-incomplete' },
      response: { ...response, status: 'incomplete', output: null },
    },
    expectedError: 'PROVIDER_NOT_COMPLETED',
  },
];
