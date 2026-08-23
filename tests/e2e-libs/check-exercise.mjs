// The exercises run raw - no bundler, no polyfills, full node realm - so a red artifact can be blamed
// on the toolchain rather than on the fixture. One process is safe precisely because they are raw:
// nothing here imports core-js, so no global patching leaks from one exercise into the next.
//
// Usage:  npm run test-e2e-libs-check-exercise [exercisePathOrLibName]
import { deepEqual } from './exercises/checks.mjs';
import { errorReason, renderValue } from './diagnostics.mjs';
import { withDeadline } from './deadline.mjs';
import { librariesMatching } from './libraries.mjs';
import { announceExercise, announceExerciseRun, announceScopedRun, reportExercise,
  reportExerciseFailure, reportExerciseTally } from './output.mjs';
import { HERE } from './paths.mjs';
import { pathToFileURL } from 'node:url';

const { basename, resolve } = path;

process.on('unhandledRejection', reason => {
  throw new Error(`unhandled rejection - ${ errorReason(reason) }`, { cause: reason });
});

const RUN_DEADLINE_MS = 60_000;

async function oneRun(target, name) {
  const mod = await import(pathToFileURL(target).href);
  if (typeof mod.run !== 'function') throw new Error(`${ name } does not export run()`);
  const result = await withDeadline(() => mod.run(), { ms: RUN_DEADLINE_MS, what: `${ name } run()` });
  if (!Array.isArray(result?.checks)) {
    // through `renderValue`: a circular result is a legal thing to hand back, and stringifying it
    // here would replace this diagnosis with a TypeError of its own
    throw new Error(`${ name } returned a malformed result: expected { checks: [...] }, got ${ renderValue(result).slice(0, 120) }`);
  }
  if (!result.checks.length) throw new Error(`${ name } returned no checks`);
  return result.checks;
}

// TWICE, element by element: a fixture that answers differently each time otherwise reddens a cell of
// the gating tier every other run, where it reads as a flaky toolchain. The class is live, `three`
// calling `Math.random()` in `generateUUID`. The label too, since a check without one passes the
// gating tier's comparison.
async function checksOf(target, name) {
  const first = await oneRun(target, name);
  const second = await oneRun(target, name);
  function notDeterministic(detail) {
    return new Error(`${ name } is not deterministic: ${ detail }`);
  }
  if (first.length !== second.length) throw notDeterministic(`${ first.length } checks on the first run, ${ second.length } on the second`);
  for (const [index, check] of first.entries()) {
    const other = second[index];
    if (check.label === undefined) throw new Error(`${ name } check #${ index + 1 } has no label`);
    if (check.label !== other.label) throw notDeterministic(`check #${ index + 1 } is '${ check.label }' on the first run and '${ other.label }' on the second`);
    if (check.pass !== other.pass || !deepEqual(check.actual, other.actual)) {
      throw notDeterministic(`'${ check.label }' gave ${ renderValue(check.actual) } on the first run and ${ renderValue(other.actual) } on the second`);
    }
  }
  return first;
}

const [arg] = argv._.map(String);
// a separator decides: an absolute path cannot be without one, and a library name cannot carry one
const looksLikePath = arg !== undefined && /[/\\]/.test(arg);
const targets = looksLikePath ? [resolve(HERE, arg)] : librariesMatching(arg).map(lib => lib.exercise);

announceScopedRun(arg);
announceExerciseRun(targets);

let total = 0;
let failing = 0;
const broken = [];
for (const target of targets) {
  const name = basename(target);
  announceExercise(name);
  let checks;
  try {
    checks = await checksOf(target, name);
  } catch (error) {
    broken.push(name);
    reportExerciseFailure(name, errorReason(error));
    continue;
  }
  const failingChecks = checks.filter(check => !check.pass);
  total += checks.length;
  failing += failingChecks.length;
  reportExercise({ checks, failingChecks });
}

reportExerciseTally({ total, targets: targets.length, failing, broken });
if (failing || broken.length) process.exitCode = 1;
