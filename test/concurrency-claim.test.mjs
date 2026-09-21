import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, mkdtemp, readFile, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { executeVerifiedRun } from '../src/runtime-gate.mjs';

const baseRequest = {
  runId: 'run-concurrent-001',
  inputBindings: ['evidence:a1'],
  inputs: [{ ref: 'evidence:a1', text: 'Synthetic evidence A' }],
  question: 'Will the synthetic event resolve YES?',
  maxLatencyMs: 1500,
  maxCostUsd: 0.02,
  pricing: { inputUsdPerMillion: 0.2, outputUsdPerMillion: 1.2 },
};

function response(id = 'resp_concurrent_1') {
  return {
    status: 'completed', latencyMs: 40, costUsd: 0.004,
    usage: { inputTokens: 120, outputTokens: 30 },
    providerResponseId: id,
    output: {
      decision: 'FORECAST', pYes: 0.64, uncertainty: 'MEDIUM',
      strongestLimitation: 'Synthetic fixture only', inputRefsUsed: ['evidence:a1'],
    },
  };
}
function claimPathFor(journalPath, runId) {
  const digest = createHash('sha256').update(runId).digest('hex');
  return `${journalPath}.${digest}.claim`;
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

test('concurrent identical runId calls execute provider once and replay one record', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'aff-concurrent-'));
  const journalPath = join(dir, 'runs.jsonl');
  let calls = 0;
  const provider = async () => {
    calls += 1;
    await new Promise((resolve) => setTimeout(resolve, 35));
    return response();
  };

  const [first, second] = await Promise.all([
    executeVerifiedRun({ request: baseRequest, provider, journalPath }),
    executeVerifiedRun({ request: baseRequest, provider, journalPath }),
  ]);
  const records = (await readFile(journalPath, 'utf8')).trim().split('\n');
  assert.equal(calls, 1);
  assert.equal(records.length, 1);
  assert.deepEqual(second, first);
  assert.equal(await exists(claimPathFor(journalPath, baseRequest.runId)), false);
});

test('concurrent conflicting request under the same runId fails closed without a second provider call', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'aff-concurrent-conflict-'));
  const journalPath = join(dir, 'runs.jsonl');
  let calls = 0;
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const provider = async () => {
    calls += 1;
    await gate;
    return response('resp_conflict_winner');
  };

  const first = executeVerifiedRun({ request: baseRequest, provider, journalPath });
  await new Promise((resolve) => setTimeout(resolve, 10));
  const conflicting = executeVerifiedRun({
    request: { ...baseRequest, question: 'A conflicting question under the same run id' },
    provider,
    journalPath,
  });
  const conflictRejected = assert.rejects(conflicting, /IDEMPOTENCY_KEY_CONFLICT/);
  release();

  await first;
  await conflictRejected;
  assert.equal(calls, 1);
  assert.equal(await exists(claimPathFor(journalPath, baseRequest.runId)), false);
});

test('stale run claim is reclaimed before provider execution', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'aff-stale-claim-'));
  const journalPath = join(dir, 'runs.jsonl');
  const claimPath = claimPathFor(journalPath, baseRequest.runId);
  await writeFile(claimPath, '', 'utf8');
  const stale = new Date(Date.now() - 120_000);
  await utimes(claimPath, stale, stale);
  let calls = 0;
  const provider = async () => {
    calls += 1;
    return response('resp_after_stale_claim');
  };

  const result = await executeVerifiedRun({ request: baseRequest, provider, journalPath });
  assert.equal(result.providerResponseId, 'resp_after_stale_claim');
  assert.equal(calls, 1);
  assert.equal(await exists(claimPath), false);
});

test('failed provider releases claim so a later retry can execute', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'aff-release-claim-'));
  const journalPath = join(dir, 'runs.jsonl');
  const claimPath = claimPathFor(journalPath, baseRequest.runId);
  await assert.rejects(
    () => executeVerifiedRun({
      request: baseRequest,
      provider: async () => { throw new Error('synthetic provider failure'); },
      journalPath,
    }),
    /synthetic provider failure/,
  );
  assert.equal(await exists(claimPath), false);

  let calls = 0;
  const result = await executeVerifiedRun({
    request: baseRequest,
    provider: async () => { calls += 1; return response('resp_retry_after_failure'); },
    journalPath,
  });
  assert.equal(calls, 1);
  assert.equal(result.providerResponseId, 'resp_retry_after_failure');
  assert.equal(await exists(claimPath), false);
});


function runWorker(workerPath, journalPath, callsPath, runId) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [workerPath, journalPath, callsPath, runId], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) return reject(new Error(`worker failed ${code}: ${stderr}`));
      resolve(JSON.parse(stdout.trim()));
    });
  });
}

test('two Node processes coordinate one provider execution for the same runId', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'aff-multiprocess-'));
  const journalPath = join(dir, 'runs.jsonl');
  const callsPath = join(dir, 'provider-calls.log');
  const runId = 'run-multiprocess-001';
  const workerPath = fileURLToPath(new URL('./fixtures/concurrent-worker.mjs', import.meta.url));

  const [first, second] = await Promise.all([
    runWorker(workerPath, journalPath, callsPath, runId),
    runWorker(workerPath, journalPath, callsPath, runId),
  ]);
  const calls = (await readFile(callsPath, 'utf8')).trim().split('\n');
  const records = (await readFile(journalPath, 'utf8')).trim().split('\n');

  assert.equal(calls.length, 1);
  assert.equal(records.length, 1);
  assert.deepEqual(second, first);
  assert.equal(await exists(claimPathFor(journalPath, runId)), false);
});
