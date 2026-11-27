// The exercises run raw - no bundler, no polyfills, full node realm - so a red artifact can be blamed
// on the toolchain rather than on the fixture. Each exercise runs in a child process under a deadline.
//
// Usage:  npm run test-e2e-libs-check-exercise [exercisePathOrLibName]
import { deepEqual } from 'node:assert/strict';
import './suite-tests.mjs';
import { errorReason } from './diagnostics.mjs';
import { librariesMatching } from './libraries.mjs';
import { announceExercise, announceExerciseRun, announceScopedRun, reportExercise,
  reportExerciseFailure, reportExerciseTally } from './output.mjs';
import { HERE } from './paths.mjs';
import { assertRawCheckFloor, rawChecks } from './raw-exercise.mjs';

const { basename, resolve } = path;

process.on('unhandledRejection', reason => {
  throw new Error(`unhandled rejection - ${ errorReason(reason) }`, { cause: reason });
});

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
    checks = await rawChecks(target, { repeat: true });
    if (target === resolve(HERE, 'exercises/echarts.mjs') && checks.every(check => check.pass)) {
      const shifted = await rawChecks(resolve(HERE, 'echarts-grid-test.mjs'));
      deepEqual(shifted.filter(check => !check.pass).map(check => check.label), ['bars: each intersects the grid']);
    }
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

if (!failing && !broken.length) assertRawCheckFloor(total, arg !== undefined);
reportExerciseTally({ total, targets: targets.length, failing, broken });
if (failing || broken.length) process.exitCode = 1;
