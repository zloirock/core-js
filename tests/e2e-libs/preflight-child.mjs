// Run in a disposable Node process. With no module or exports in scope, UMD exposes a global.
import { runInThisContext } from 'node:vm';
import { captureChecks, checkResultProblem, checkRows } from './diagnostics.mjs';

export async function runPreflight(code) {
  if (!code.trim()) throw new Error('pre-flight child got an empty bundle');
  runInThisContext(code, { filename: 'e2e-libs bundle' });
  const { run } = globalThis.E2E ?? {};
  if (typeof run !== 'function') throw new Error('the bundle exposed no `E2E.run` - its UMD header did not run');
  const checks = captureChecks(await run());
  const problem = checkResultProblem(checks);
  if (problem) throw new Error(`pre-flight - ${ problem }`);
  return checkRows(checks);
}
