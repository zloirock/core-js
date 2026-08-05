// Dev helper: run exercises raw (no bundler, no polyfills, full node realm) and report which
// self-checks pass. This validates an exercise's own logic and its expected literals before any
// bundling is involved, so a red artifact can be blamed on the toolchain rather than the fixture.
// With no argument EVERY registered exercise runs — the `e2e-libs` npm script depends on that;
// pass a library name or a path to narrow it to one.
//
// Running them all in one process is safe precisely because they are raw: nothing here imports
// core-js, so there is no global patching for one exercise to leak into the next (that isolation
// concern is real for `runtime.mjs`, which is why its pre-flight forks a child per bundle).
//
// Usage:  node check-exercise.mjs [exercisePathOrLibName]
import { runnerArgs } from './args.mjs';
import { libraries } from './libraries.mjs';
import { basename, isAbsolute, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const HERE = import.meta.dirname;
const [arg, ...surplus] = runnerArgs(import.meta.url);
if (surplus.length) throw new Error(`unexpected argument(s): ${ surplus.join(' ') } — check-exercise.mjs takes one optional target`);
const targets = arg
  ? [isAbsolute(arg) ? arg : join(HERE, arg.includes('/') ? arg : `exercises/${ arg }.mjs`)]
  : libraries.map(l => l.exercise);

let total = 0;
let failing = 0;
for (const target of targets) {
  const name = basename(target);
  const mod = await import(pathToFileURL(target).href);
  if (typeof mod.run !== 'function') throw new Error(`${ name } does not export run()`);
  const res = await mod.run();
  // name the exercise in every failure mode: destructuring a malformed result would otherwise throw
  // a bare "Cannot read properties of undefined", and with no argument every registered exercise runs
  if (!Array.isArray(res?.checks)) {
    throw new Error(`${ name } returned a malformed result: expected { checks: [...] }, got ${ JSON.stringify(res)?.slice(0, 120) }`);
  }
  const { checks } = res;
  // an exercise that silently stopped reporting would otherwise pass as "0 checks, 0 failing"
  if (!checks.length) throw new Error(`${ name } returned no checks`);
  const bad = checks.filter(c => !c.pass);
  total += checks.length;
  failing += bad.length;
  console.log(`\n${ name }`);
  for (const c of checks) {
    console.log(`${ c.pass ? '✓' : '✗' } ${ c.label }${ c.pass ? '' : `  actual=${ JSON.stringify(c.actual) } expected=${ JSON.stringify(c.expected) }` }`);
  }
  console.log(`${ checks.length } checks, ${ bad.length } failing`);
}
console.log(`\ntotal: ${ total } checks across ${ targets.length } exercise(s), ${ failing } failing`);
if (failing) process.exitCode = 1;
