import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
var _ref, _ref2;
// two distinct narrowing sources in one fixture: a direct static call (`Object.keys()`
// returns string[]) and a destructure-aliased static (`{ from } = Array`). each must
// resolve independently without cross-contaminating the other's narrowing state
const o = {
  a: 1,
  b: 2,
  c: 3
};
const k = _atMaybeArray(_ref = Object.keys(o)).call(_ref, -1);
const from = _Array$from;
const m = _flatMapMaybeArray(_ref2 = from('xyz')).call(_ref2, ch => [ch, ch.toUpperCase()]);
export { k, m };