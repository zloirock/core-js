// mixed alias source: aliasing an instance through static + a separate static through
// destructure. distinct binding kinds reach the same getPolyfillBindingEntry closure;
// both must resolve via currentInjector's per-binding entry without cross-contaminating
// resolver state across the two narrowing queries.
//   - `Object.keys(o).at(...)` exercises static-call return narrowing (string[] -> at-array)
//   - `{ from } = Array; from(...).flatMap(...)` exercises destructure-aliased static
//      whose call return narrows to Array for the chained flatMap polyfill
const o = { a: 1, b: 2, c: 3 };
const k = Object.keys(o).at(-1);
const { from } = Array;
const m = from('xyz').flatMap(ch => [ch, ch.toUpperCase()]);
export { k, m };
