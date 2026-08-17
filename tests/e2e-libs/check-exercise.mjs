// The exercises run raw - no bundler, no polyfills, full node realm - so a red artifact can be blamed
// on the toolchain rather than on the fixture. One process is safe precisely because they are raw:
// nothing here imports core-js, so no global patching leaks from one exercise into the next (that
// concern is real for runtime.mjs, which is why its pre-flight forks a child per bundle).
//
// Usage:  npm run test-e2e-libs-check-exercise [exercisePathOrLibName]
import { positionals } from './cli.mjs';
import { eq } from './exercises/checks.mjs';
import { checkFailureLine, errorReason, renderValue } from './diagnostics.mjs';
import { withDeadline } from '../transpiler-integration/deadline.mjs';
import { librariesMatching } from './libraries.mjs';
import { pathToFileURL } from 'node:url';

const { basename, isAbsolute, join } = path;

// A rejection nobody claimed ends the run either way; what this decides is what the reader gets out
// of it. node dumps the throwable raw, which for anything without a `message` is `[object Object]`,
// so the reason is turned into one line here - and the original is kept as `cause`, which node prints
// underneath with the stack this line would otherwise replace. Neither shape names the exercise.
process.on('unhandledRejection', reason => {
  throw new Error(`unhandled rejection - ${ errorReason(reason) }`, { cause: reason });
});

const HERE = import.meta.dirname;
const [arg] = positionals(argv, { names: ['target'], usage: 'check-exercise.mjs takes one optional target' });
// A PATH is taken as given - that is the form for running an exercise that is not in the registry
// yet. Anything else goes through `librariesMatching`, which fails loudly on a name it does not know
// and on an empty registry, so this runner cannot report `0 checks, 0 failing` and exit green.
const targets = arg !== undefined && (isAbsolute(arg) || arg.includes('/') || arg.includes('\\'))
  ? [isAbsolute(arg) ? arg : join(HERE, arg)]
  : librariesMatching(arg).map(l => l.exercise);

// This tier is the first step of `test-e2e-libs`, so a `run()` that never settles here would declare
// the fixture sound having checked nothing - node aborts the module on the unsettled top-level await
// and names an `await` line, never the exercise. A backstop against a fixture that stopped, not a
// budget: the exercises are deterministic and small.
const RUN_DEADLINE_MS = 60_000;

// every failure mode names the exercise: destructuring a malformed result would otherwise throw a bare
// "Cannot read properties of undefined" with nothing to say whose it was
async function oneRun(target, name) {
  const mod = await import(pathToFileURL(target).href);
  if (typeof mod.run !== 'function') throw new Error(`${ name } does not export run()`);
  const result = await withDeadline(() => mod.run(), { ms: RUN_DEADLINE_MS, what: `${ name } run()` });
  if (!Array.isArray(result?.checks)) {
    // through `renderValue`, not `JSON.stringify`: a circular result is a legal thing for an exercise
    // to hand back, and stringifying it here would replace this diagnosis with a TypeError of its own
    throw new Error(`${ name } returned a malformed result: expected { checks: [...] }, got ${ renderValue(result).slice(0, 120) }`);
  }
  // an exercise that silently stopped reporting would otherwise pass as "0 checks, 0 failing"
  if (!result.checks.length) throw new Error(`${ name } returned no checks`);
  return result.checks;
}

// TWICE, element by element. Determinism is a rule of this area and this tier is its arbiter, so the
// envelope alone is not what it checks: a fixture that answers differently each time otherwise
// reaches the gating tier, where it reddens a cell every other run and reads as a flaky toolchain -
// a fixture defect waved through by the tier that exists to tell the two apart. The class is live,
// `three` calling `Math.random()` in `generateUUID`. Element by element rather than stringifying the
// whole, because the question is WHICH check moved; the label too, since a check without one passes
// the gating tier's comparison.
async function checksOf(target, name) {
  const first = await oneRun(target, name);
  const second = await oneRun(target, name);
  if (first.length !== second.length) {
    throw new Error(`${ name } is not deterministic: ${ first.length } checks on the first run, ${ second.length } on the second`);
  }
  for (const [index, check] of first.entries()) {
    const other = second[index];
    if (check.label === undefined) throw new Error(`${ name } check #${ index + 1 } has no label`);
    if (check.label !== other.label) {
      throw new Error(`${ name } is not deterministic: check #${ index + 1 } is '${ check.label }' on the first run and '${ other.label }' on the second`);
    }
    if (check.pass !== other.pass || !eq(check.actual, other.actual)) {
      throw new Error(`${ name } is not deterministic: '${ check.label }' gave `
        + `${ renderValue(check.actual) } on the first run and ${ renderValue(other.actual) } on the second`);
    }
  }
  return first;
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
