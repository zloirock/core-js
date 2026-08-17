// The exercises run raw - no bundler, no polyfills, full node realm - so a red artifact can be blamed
// on the toolchain rather than on the fixture. One process is safe precisely because they are raw:
// nothing here imports core-js, so no global patching leaks from one exercise into the next (that
// concern is real for runtime.mjs, which is why its pre-flight forks a child per bundle).
//
// Usage:  npm run test-e2e-libs-check-exercise [exercisePathOrLibName]
import { checkFailureLine, errorReason } from './diagnostics.mjs';
import { withDeadline } from '../transpiler-integration/deadline.mjs';
import { librariesMatching } from './libraries.mjs';
import { pathToFileURL } from 'node:url';

const { basename, isAbsolute, join } = path;

// the net under every per-target `catch` below - see `deadline.mjs` for what it is against.
// Without it the process ends with no exercise named and no total printed
process.on('unhandledRejection', reason => {
  throw new Error(`unhandled rejection - ${ errorReason(reason) }`);
});

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
// This tier is the first step of `test-e2e-libs`, so a `run()` that never settles here declares the
// fixture sound having checked nothing, and silently: node drains and exits 0. A backstop against a
// fixture that stopped, not a budget - the exercises are deterministic and small.
const RUN_DEADLINE_MS = 60_000;

async function checksOf(target, name) {
  const mod = await import(pathToFileURL(target).href);
  if (typeof mod.run !== 'function') throw new Error(`${ name } does not export run()`);
  const result = await withDeadline(() => mod.run(), { ms: RUN_DEADLINE_MS, what: `${ name } run()` });
  if (!Array.isArray(result?.checks)) {
    throw new Error(`${ name } returned a malformed result: expected { checks: [...] }, got ${ JSON.stringify(result)?.slice(0, 120) }`);
  }
  // an exercise that silently stopped reporting would otherwise pass as "0 checks, 0 failing"
  if (!result.checks.length) throw new Error(`${ name } returned no checks`);
  return result.checks;
}

// named before the first one runs: this tier is fast, but it is also the one that says whether a red
// runtime cell is the toolchain's fault or the fixture's, and that is not readable from a bare list
// of check labels scrolling past
echo(chalk.green(`exercises, raw in node - no bundler, no polyfills: ${ chalk.cyan(targets.length) } target(s)`
  + ` - ${ chalk.cyan(targets.map(t => basename(t)).join(', ')) }`));

let total = 0;
let failing = 0;
const broken = [];
for (const target of targets) {
  const name = basename(target);
  echo(chalk.green(`\n${ chalk.cyan(name) }`));
  let checks;
  try {
    checks = await checksOf(target, name);
  } catch (error) {
    broken.push(name);
    echo(chalk.red(`FAIL ${ chalk.cyan(name) } did not run: ${ errorReason(error) }`));
    continue;
  }
  const bad = checks.filter(c => !c.pass);
  total += checks.length;
  failing += bad.length;
  for (const check of checks) {
    echo((check.pass ? chalk.green : chalk.red)(check.pass
      ? `ok   ${ chalk.cyan(check.label) }`
      : `FAIL ${ checkFailureLine(check) }`));
  }
  echo((bad.length ? chalk.red : chalk.green)(`${ chalk.cyan(checks.length) } checks, ${ chalk.cyan(bad.length) } failing`));
}
echo((failing || broken.length ? chalk.red : chalk.green)(`\ntotal: ${ chalk.cyan(total) } checks across `
  + `${ chalk.cyan(targets.length) } exercise(s), ${ chalk.cyan(failing) } failing`
  + `${ broken.length ? `, ${ chalk.cyan(broken.length) } exercise(s) did not run: ${ chalk.cyan(broken.join(', ')) }` : '' }`));
if (failing || broken.length) process.exitCode = 1;
