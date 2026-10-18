// The registry's `inert` claim - a static runs no code of its arguments - checked against both
// implementations a target can end up with: the engine's own and core-js's. A trap at each of the first
// three slots counts every coercion, iteration, `toJSON`, `then` and accessor read the call performs. The
// core-js version counts as much as the native one: an error message built with `String(argument)` runs
// the argument's own conversion, and `Symbol.keyFor` is not `inert` for exactly that reason
import { deepEqual, ok } from 'node:assert/strict';
import { createContext, loadCoreJS, runInContext } from './core-js-realm.mjs';

const { globals, statics } = await fs.readJson('packages/core-js-compat/built-in-definitions.json');
const { staticMethods } = await fs.readJson('packages/core-js-compat/known-built-in-return-types.json');

const TRAP = `(function () {
  var ran = { count: 0 };
  function hit() { ran.count++; }
  var value = {
    valueOf: function () { hit(); return 1; },
    toString: function () { hit(); return 'key'; },
    toJSON: function () { hit(); return null; },
    then: function (resolve) { hit(); resolve(1); },
  };
  value[Symbol.toPrimitive] = function () { hit(); return 1; };
  value[Symbol.iterator] = function () { hit(); return [][Symbol.iterator](); };
  ['length', 'raw', 'next', 'value', 'get', 'set', 'enumerable', 'configurable', 'writable'].forEach(function (key) {
    Object.defineProperty(value, key, { enumerable: true, configurable: true, get: hit });
  });
  return { value: value, ran: ran };
})`;

// the `full` entry a definition loads first
function entryFile(definition) {
  const dependency = definition?.global.dependencies[0];
  return dependency && `${ path.resolve('packages/core-js/full', dependency) }.js`;
}

// the argument code the static runs with the trap at each of the first three slots, or null where this
// implementation does not exist: an engine without the static, one core-js has no definition for, and
// one core-js cannot even load without - an ES5 native its own internals call, which every engine it
// supports has, so that static only ever runs as the engine's
const enginesOnly = [];
function argumentCodeRuns(owner, method, mode) {
  const context = createContext();
  if (mode === 'core-js') {
    const entry = entryFile(statics[owner]?.[method]);
    if (!entry) return null;
    const cache = new Map();
    try {
      // an owner the engine lacks (`SuppressedError` before Node 24) is core-js's as well, or the static
      // has nothing to be read off
      if (runInContext(`typeof globalThis.${ owner }`, context) === 'undefined') loadCoreJS(context, entryFile(globals[owner]), cache);
      // deleted along the constructor chain an inherited static is found on (`AggregateError.isError`)
      // the prototype walk is captured first: the static under check may be this very one
      runInContext(`var up = Object.getPrototypeOf;
        for (var o = ${ owner }; o && o !== Function.prototype; o = up(o)) delete o.${ method };`, context);
      loadCoreJS(context, entry, cache);
    } catch {
      enginesOnly.push(`${ owner }.${ method }`);
      return null;
    }
  }
  if (runInContext(`typeof globalThis.${ owner }?.${ method }`, context) !== 'function') return null;
  const trap = runInContext(TRAP, context);
  const call = runInContext(`(function (args) { try { ${ owner }.${ method }.apply(${ owner }, args); } catch (error) { /* a refusal runs nothing more */ } })`, context);
  return [0, 1, 2].map(slot => {
    const { value, ran } = trap();
    const args = [undefined, undefined, undefined];
    args[slot] = value;
    call(args);
    return ran.count;
  });
}

// the trap has to fire where a call does coerce, in both implementations, or every zero below reads as nothing
for (const mode of ['native', 'core-js']) {
  ok(argumentCodeRuns('Math', 'hypot', mode)?.some(Boolean), `control: Math.hypot (${ mode }) coerces its arguments`);
}

for (const [owner, methods] of Object.entries(staticMethods)) for (const [method, hint] of Object.entries(methods)) {
  if (!hint.inert) continue;
  let implementations = 0;
  for (const mode of ['native', 'core-js']) {
    const runs = argumentCodeRuns(owner, method, mode);
    if (runs === null) continue;
    implementations++;
    deepEqual(runs, [0, 0, 0], `${ owner }.${ method } (${ mode }) runs no code of its arguments`);
  }
  ok(implementations, `${ owner }.${ method }: at least one implementation is checked`);
}

echo(chalk.green(`inert statics tested, the engine's implementation only: ${ chalk.cyan(enginesOnly.join(', ')) }`));
