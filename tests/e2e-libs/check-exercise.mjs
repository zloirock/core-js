// The exercises run raw - no bundler, no polyfills, full node realm - so a red artifact can be blamed
// on the toolchain rather than on the fixture. One process is safe precisely because they are raw:
// nothing here imports core-js, so no global patching leaks from one exercise into the next (that
// concern is real for runtime.mjs, which is why its pre-flight forks a child per bundle).
//
// Usage:  npm run test-e2e-libs-check-exercise [exercisePathOrLibName]
import { librariesMatching } from './libraries.mjs';
import { pathToFileURL } from 'node:url';

const { basename, isAbsolute, join } = path;

const HERE = import.meta.dirname;
const [arg, ...surplus] = argv._;
if (surplus.length) throw new Error(`unexpected argument(s): ${ surplus.join(' ') } - check-exercise.mjs takes one optional target`);
// A PATH is taken as given - that is the form for running an exercise that is not in the registry
// yet. Anything else goes through `librariesMatching`, which fails loudly on a name it does not know
// and on an empty registry, so this runner cannot report `0 checks, 0 failing` and exit green.
const targets = arg && (isAbsolute(arg) || arg.includes('/') || arg.includes('\\'))
  ? [isAbsolute(arg) ? arg : join(HERE, arg)]
  : librariesMatching(arg).map(l => l.exercise);

// every failure mode names the exercise: destructuring a malformed result would otherwise throw a bare
// "Cannot read properties of undefined" with nothing to say whose it was
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
