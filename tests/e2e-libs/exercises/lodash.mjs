// lodash-es: the type predicates over built-ins, a deep clone and deep equality through Map, Set, Date, a
// typed array and a symbol-keyed property, arrays out of collections and an iterable, memoization,
// property paths, and a template compiled at run time. Expected values follow from the inputs and
// lodash's documented API, but for two of lodash's choices it does not document: `toArray` takes an
// iterable through its iterator and a Map as its `[key, value]` pairs, and a deep clone copies
// symbol-keyed properties.
//
// Its reason is ACCESS through a root the library finds itself. lodash resolves the global object -
// `global`, then `self`, then `Function('return this')()` - and reads some built-ins off it instead of
// by name: when a module loads, `Symbol` and `Uint8Array` directly and `Map`, `Set`, `WeakMap`,
// `Promise` and `DataView` through `getNative(root, 'Map')`, each into a module of its own that 14
// others import under the built-in's name, and `isFinite`, `parseInt` and `Date` where they are used. No
// provider sees those reads; what answers for them is what the root holds when they happen, so on an
// engine without `Symbol` the global version's has to be on the global object before `_Symbol.js` loads.
// The lookup's own `typeof global` and `typeof self` lower to Babel's `_typeof`, which puts `es.symbol`
// into `_freeGlobal.js` and `_root.js` ahead of that read - in every `usage-global` cell but unplugin's
// `pre`, which runs before Babel emits the helper. Handed a root without `Symbol`, `to_array` goes red;
// without `Uint8Array`, the clone throws. The one part of the lookup a provider does see is `self`,
// injected into `_root.js` by both: in the global version `web.self` redefines a `self` that is not the
// global object, and in `usage-pure` the read itself is replaced by core-js's own `self`.
//
// lodash also vets the five it reaches through `getNative` by their source text, which is what
// core-js's `[native code]` `Function#toString` is kept for - but each has a fallback, so no check here
// depends on it: with that `toString` neutralised every global cell still passes in a realm without
// `Symbol`. Not `isNative`: by lodash's design it throws once any core-js copy has put its shared store on
// the global object.
//
// RED in the `usage-pure` cells in a realm without `Symbol`, IE11's shape, and declared so in
// `libraries.mjs` as a browser diagnostic. There the application's `new Map()` is core-js's pure Map,
// and lodash knows a Map by its tag or - where the engine's own Map has none, as on IE11 - by the native
// constructor, and the pure version may touch neither: `isMap` answers false, and `cloneDeep` copies it
// into an object with Map's prototype and no state, whose `get` throws. That is the pure version's
// limit, not a provider's - any library checking tags or native constructors meets it. Locally the
// stripped realm keeps `Symbol`, so the pure Map carries its tag and those cells pass.
import { cloneDeep, get, isEqual, isMap, isSet, isSymbol, isTypedArray, isWeakMap, memoize, set, template, toArray } from 'lodash-es';
import { checker } from './checks.mjs';

export function run() {
  const { checks, check } = checker();
  check('natives', [isMap(new Map()), isSet(new Set()), isWeakMap(new WeakMap()), isTypedArray(new Uint8Array(1)), isSymbol(Symbol('s'))],
    [true, true, true, true, true]);

  const key = Symbol('key');
  const source = { m: new Map([['k', { n: [1] }]]), s: new Set([2]), d: new Date(0), t: new Uint8Array([3, 4]), [key]: 5 };
  const copy = cloneDeep(source);
  check('clone_deep', [
    copy.m.get('k'), copy.m.get('k') !== source.m.get('k'), copy.s.has(2), copy.d.getTime(),
    copy.t instanceof Uint8Array && copy.t !== source.t ? Array.from(copy.t) : null, copy[key], isEqual(copy, source),
  ], [{ n: [1] }, true, true, 0, [3, 4], 5, true]);

  check('equal', [
    isEqual(new Map([[1, { a: [1] }]]), new Map([[1, { a: [1] }]])),
    isEqual(new Map([[1, { a: [1] }]]), new Map([[1, { a: [2] }]])),
    isEqual(new Set([{ b: 1 }]), new Set([{ b: 1 }])),
  ], [true, false, true]);

  const iterable = {
    * [Symbol.iterator]() {
      yield 6;
      yield 7;
    },
  };
  check('to_array', [toArray(new Set([1, 2])), toArray(new Map([['a', 1]])), toArray(iterable)], [[1, 2], [['a', 1]], [6, 7]]);

  const square = memoize(x => ({ v: x ** 2 }));
  const first = square(3);
  check('memoize', [first.v, square(3) === first, square.cache.has(3)], [9, true, true]);

  const target = {};
  set(target, 'a[0].b', 4);
  check('paths', [get(target, 'a[0].b'), get(target, ['a', 0, 'b']), get(target, 'x.y', 'none')], [4, 4, 'none']);

  // eslint-disable-next-line no-template-curly-in-string -- lodash's own ES delimiter, filled by `template`
  check('template', template('hi <%= user %>, ${ n }: <%- tag %>')({ user: 'ada', n: 2, tag: '<b>' }), 'hi ada, 2: &lt;b&gt;');
  return { checks };
}
