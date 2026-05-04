import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$from from "@core-js/pure/actual/array/from";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
var _ref, _ref2;
// mixed alias source: aliasing an instance through static + a separate static through
// destructure. distinct binding kinds reach the same getPolyfillBindingEntry closure;
// both must resolve via currentInjector's per-binding entry without cross-contaminating
// resolver state across the two narrowing queries.
//   - `Object.keys(o).at(...)` exercises static-call return narrowing (string[] -> at-array)
//   - `{ from } = Array; from(...).flatMap(...)` exercises destructure-aliased static
//      whose call return narrows to Array for the chained flatMap polyfill
const o = {
  a: 1,
  b: 2,
  c: 3
};
const k = _atMaybeArray(_ref = Object.keys(o)).call(_ref, -1);
const from = _Array$from;
const m = _flatMapMaybeArray(_ref2 = from('xyz')).call(_ref2, ch => [ch, ch.toUpperCase()]);
export { k, m };