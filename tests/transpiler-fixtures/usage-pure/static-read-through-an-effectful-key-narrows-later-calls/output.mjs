import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref, _ref2, _ref3, _ref6;
// a static read through a key that runs code binds the static's own entry, and a later call off that
// binding narrows by the static's known return, as off a plainly keyed one - alone, with a default,
// behind another such key, and nested under a captured init
function l(t, v) {
  return v;
}
function make() {
  return {
    w: Array,
    other: 1
  };
}
const from = (l('k', 'from'), _Array$from);
export const last = _atMaybeArray(_ref = from([1, 2])).call(_ref, -1);
const of = (l('k2', 'of'), _Array$of);
export const has = _includesMaybeArray(_ref2 = of(1, 2)).call(_ref2, 2);
const fromAsync = (l('k3', 'fromAsync'), _Array$fromAsync),
  from2 = (l('k4', 'from'), _Array$from);
export const first = _atMaybeArray(_ref3 = from2([3])).call(_ref3, 0);
const _ref5 = (l('s', 0), make()),
  {
    w: _ref4
  } = _ref5,
  from3 = (l('k5', 'from'), _Array$from),
  {
    other
  } = _ref5;
export const third = _atMaybeArray(_ref6 = from3([4])).call(_ref6, 0);
export { fromAsync, other };