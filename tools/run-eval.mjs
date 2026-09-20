import { evaluateFixtureSet } from '../src/runtime-gate.mjs';
import { fixtures } from '../eval/fixtures.mjs';

const report = evaluateFixtureSet(fixtures);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (report.failed > 0) process.exitCode = 1;
