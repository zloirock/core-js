// Run the exercises raw - no bundler, no polyfills, full node realm - and report which self-checks
// pass. This validates an exercise's own logic and its expected literals before any bundling is
// involved, so a red artifact can be blamed on the toolchain rather than on the fixture. With no
// argument EVERY registered exercise runs; pass a library name or a path to narrow it to one.
//
// Running them all in one process is safe precisely because they are raw: nothing here imports
// core-js, so there is no global patching for one exercise to leak into the next (that isolation
// concern is real for `runtime.mjs`, which is why its pre-flight forks a child per bundle).
//
// One broken exercise must not hide the state of the others, so every failure mode - a missing
// `run()`, a malformed result, an exercise that throws - is recorded against that exercise and the
// run continues. The exit code is decided once, at the end.
//
// Usage:  npm run e2e-libs-check-exercise [exercisePathOrLibName]
import { libraries } from './libraries.mjs';
import { pathToFileURL } from 'node:url';

const { basename, isAbsolute, join } = path;

const HERE = import.meta.dirname;
const [arg, ...surplus] = argv._;
if (surplus.length) throw new Error(`unexpected argument(s): ${ surplus.join(' ') } - check-exercise.mjs takes one optional target`);
const targets = arg
  ? [isAbsolute(arg) ? arg : join(HERE, arg.includes('/') ? arg : `exercises/${ arg }.mjs`)]
  : libraries.map(l => l.exercise);

// name the exercise in every failure mode: destructuring a malformed result would otherwise throw a
// bare "Cannot read properties of undefined", and with no argument every registered exercise runs
async function checksOf(target, name) {
  const mod = await import(pathToFileURL(target).href);
  if (typeof mod.run !== 'function') throw new Error(`${ name } does not export run()`);
  const result = await mod.run();
  if (!Array.isArray(result?.checks)) {
    throw new Error(`${ name } returned a malformed result: expected { checks: [...] }, got ${ JSON.stringify(result)?.slice(0, 120) }`);
  }
  // an exercise that silently stopped reporting would otherwise pass as "0 checks, 0 failing"
  if (!result.checks.length) throw new Error(`${ name } returned no checks`);
  return result.checks;
}

let total = 0;
let failing = 0;
const broken = [];
for (const target of targets) {
  const name = basename(target);
  echo(`\n${ name }`);
  let checks;
  try {
    checks = await checksOf(target, name);
  } catch (error) {
    broken.push(name);
    echo(`FAIL ${ name } did not run: ${ error.message }`);
    continue;
  }
  const bad = checks.filter(c => !c.pass);
  total += checks.length;
  failing += bad.length;
  for (const check of checks) {
    echo(`${ check.pass ? 'ok  ' : 'FAIL' } ${ check.label }${ check.pass ? ''
      : `  actual=${ JSON.stringify(check.actual) } expected=${ JSON.stringify(check.expected) }` }`);
  }
  echo(`${ checks.length } checks, ${ bad.length } failing`);
}
echo(`\ntotal: ${ total } checks across ${ targets.length } exercise(s), ${ failing } failing`
  + `${ broken.length ? `, ${ broken.length } exercise(s) did not run: ${ broken.join(', ') }` : '' }`);
if (failing || broken.length) process.exitCode = 1;
