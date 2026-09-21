import { appendFile } from 'node:fs/promises';
import { executeVerifiedRun } from '../../src/runtime-gate.mjs';

const [journalPath, callsPath, runId] = process.argv.slice(2);
const request = {
  runId,
  inputBindings: ['evidence:a1'],
  inputs: [{ ref: 'evidence:a1', text: 'Synthetic evidence A' }],
  question: 'Will the synthetic event resolve YES?',
  maxLatencyMs: 1500,
  maxCostUsd: 0.02,
  pricing: { inputUsdPerMillion: 0.2, outputUsdPerMillion: 1.2 },
};

const provider = async () => {
  await appendFile(callsPath, `${process.pid}\n`, 'utf8');
  await new Promise((resolve) => setTimeout(resolve, 80));
  return {
    status: 'completed', latencyMs: 80, costUsd: 0.004,
    usage: { inputTokens: 120, outputTokens: 30 },
    providerResponseId: `resp_worker_${process.pid}`,
    output: {
      decision: 'FORECAST', pYes: 0.64, uncertainty: 'MEDIUM',
      strongestLimitation: 'Synthetic fixture only', inputRefsUsed: ['evidence:a1'],
    },
  };
};
const result = await executeVerifiedRun({ request, provider, journalPath });
process.stdout.write(`${JSON.stringify(result)}\n`);
