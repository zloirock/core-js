// The `usage-pure` oracle: a missed REWRITE is a raw read that throws here, where every other realm
// still answers it with the native. In-process, unlike the pre-flight beside it - the pure flavor
// writes no global, and a fresh context per cell is then the whole isolation.
import { createContext, runInContext } from 'node:vm';
import { errorReason } from './diagnostics.mjs';
import { E2E_STRIP_REALM_GLOBALS, ITERATOR_PROTO_HELPERS, buildStripScript } from '../transpiler-differential/strip-manifest.mjs';
import { withDeadline } from './deadline.mjs';

const STRIP = buildStripScript(E2E_STRIP_REALM_GLOBALS, ITERATOR_PROTO_HELPERS);
const RUN_DEADLINE_MS = 120_000;

// held to the label SEQUENCE, not the count: a realm reproducing OTHER checks ran another exercise
export async function strippedLeg(code, label, expected) {
  try {
    // bare of node's host globals, so a pure ponyfill that would have leaned on one takes its own path
    const context = createContext({ console, setTimeout, clearTimeout, setInterval, clearInterval, queueMicrotask });
    runInContext(STRIP, context, { filename: `${ label } [strip]` });
    runInContext(code, context, { filename: `${ label } [bundle]` });
    const result = await withDeadline(() => Promise.resolve(context.E2E.run()),
      { ms: RUN_DEADLINE_MS, what: `${ label } run() in the stripped realm` });

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
    return { ok: false, reason: errorReason(err) };
  }
}
