// The `usage-pure` oracle: a missed REWRITE of a built-in the manifest strips is a raw read that throws
// here, where every other realm still answers it with the native; one it keeps answers here too.
// In-process, unlike the pre-flight beside it - the pure flavor writes no global, and a fresh context
// per cell is then the whole isolation.
import { createContext, runInContext } from 'node:vm';
import { errorReason } from './diagnostics.mjs';
import { E2E_STRIP_REALM_GLOBALS, ITERATOR_PROTO_HELPERS, buildStripScript } from '../transpiler-differential/strip-manifest.mjs';
import { withDeadline } from './deadline.mjs';

const STRIP = buildStripScript(E2E_STRIP_REALM_GLOBALS, ITERATOR_PROTO_HELPERS);
const RUN_DEADLINE_MS = 120_000;

// held to the label SEQUENCE, not the count: a realm reproducing OTHER checks ran another exercise
export async function strippedLeg(code, label, expected, timeout = RUN_DEADLINE_MS) {
  const timers = new Set();
  let finished = false;
  function remember(timer) {
    // A queued microtask may reach the timer API after the verdict has already settled.
    if (finished) clearTimeout(timer);
    else timers.add(timer);
    return timer;
  }

  function clear(timer) {
    timers.delete(timer);
    clearTimeout(timer);
  }

  let stage = 'load';
  try {
    // bare of other node globals, so a pure ponyfill takes the same path it would in a browser
    const context = createContext({
      console,
      queueMicrotask,
      setTimeout: (...args) => remember(setTimeout(...args)),
      setInterval: (...args) => remember(setInterval(...args)),
      clearTimeout: clear,
      clearInterval: clear,
    });
    runInContext(STRIP, context, { filename: `${ label } [strip]`, timeout });
    runInContext(code, context, { filename: `${ label } [bundle]`, timeout });
    stage = 'run()';
    const result = await withDeadline(() => runInContext('E2E.run()', context, { filename: `${ label } [run]`, timeout }),
      { ms: timeout, what: `${ label } run() in the stripped realm` });

    const checks = result?.checks ?? [];
    const drift = checks.length !== expected.length
      || expected.some((check, index) => checks[index]?.label !== check.label);
    if (drift) return { ok: false, reason: `reproduced ${ checks.length } checks, the pre-flight recorded ${ expected.length }` };
    const bad = checks.filter(check => !check.pass);
    if (bad.length) return { ok: false, reason: `${ bad.length }/${ checks.length } failed`, bad };
    return { ok: true, count: checks.length };
  } catch (err) {
    // a throw IS the shape a missed rewrite takes - a raw native read the realm no longer answers -
    // so it is a verdict on the cell, not a broken leg
    const reason = err?.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT'
      ? `${ label } ${ stage } exceeded ${ timeout }ms in the stripped realm`
      : errorReason(err);
    return { ok: false, reason };
  } finally {
    finished = true;
    for (const timer of timers) clearTimeout(timer);
  }
}
