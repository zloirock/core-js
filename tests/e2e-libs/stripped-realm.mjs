// The `usage-pure` oracle: a missed REWRITE of a built-in the manifest strips is a raw read that throws
// here, where every other realm still answers it with the native; one it keeps answers here too.
// A child process owns each context, so even code that stalls in a callback has a deadline.
import { setImmediate } from 'node:timers/promises';
import { createContext, runInContext } from 'node:vm';
import { captureChecks, checkFailureLine, checkResultProblem, errorReason } from './diagnostics.mjs';
import { E2E_STRIP_REALM_GLOBALS, ITERATOR_PROTO_HELPERS, buildStripScript } from '../transpiler-differential/strip-manifest.mjs';
import { ChildExerciseError, runWithDeadline } from './deadline.mjs';

const STRIP = buildStripScript(E2E_STRIP_REALM_GLOBALS, ITERATOR_PROTO_HELPERS);
const RUN_DEADLINE_MS = 120_000;

// held to the label SEQUENCE, not the count: a realm reproducing OTHER checks ran another exercise
export async function strippedLeg(code, label, expected, timeout = RUN_DEADLINE_MS) {
  try {
    return await runWithDeadline(import.meta.url, 'runStripped', [code, label, expected], {
      ms: timeout,
      what: `${ label } in the stripped realm`,
    });
  } catch (error) {
    return { ok: false, reason: errorReason(error), exerciseError: error instanceof ChildExerciseError };
  }
}

// Only an exercise exception can be a pre-phase diagnostic; a dead runner has no verdict.
export function strippedFails(result, phase) {
  return result !== null && !result.ok && (phase !== 'pre' || result.exerciseError !== true);
}

// Drain callbacks already queued by a synchronous run before committing its result.
async function runExercise(context, label) {
  const result = await runInContext('E2E.run()', context, { filename: `${ label } [run]` });
  return setImmediate(captureChecks(result));
}

export async function runStripped(code, label, expected) {
  let finished = false;
  const { promise: callbackFailure, reject } = Promise.withResolvers();

  // These callbacks run on the host event loop. A missed rewrite there still belongs to this cell.
  function guardCallback(fn) {
    if (typeof fn !== 'function') return fn;
    return function (...args) {
      if (finished) return;
      try {
        Reflect.apply(fn, this, args);
      } catch (error) {
        reject(error);
      }
    };
  }

  try {
    // bare of other node globals, so a pure ponyfill takes the same path it would in a browser
    const context = createContext({
      console,
      queueMicrotask: fn => queueMicrotask(guardCallback(fn)),
      setTimeout: (fn, ...args) => setTimeout(guardCallback(fn), ...args),
      setInterval: (fn, ...args) => setInterval(guardCallback(fn), ...args),
      clearTimeout,
      clearInterval,
    });
    runInContext(STRIP, context, { filename: `${ label } [strip]` });
    runInContext(code, context, { filename: `${ label } [bundle]` });
    const checks = await Promise.race([runExercise(context, label), callbackFailure]);
    const problem = checkResultProblem(checks, expected);
    if (problem) return { ok: false, reason: problem, checksFailed: true };
    const bad = [];
    for (let index = 0; index < checks.length; index++) {
      if (!checks[index].pass) bad.push(checkFailureLine(checks[index]));
    }
    if (bad.length) return { ok: false, reason: `${ bad.length }/${ checks.length } failed`, checksFailed: true, bad };
    return { ok: true, count: checks.length };
  } finally {
    // Skip late callbacks while the parent is receiving the verdict and stopping this process.
    finished = true;
  }
}
