import _Array$from from "@core-js/pure/actual/array/from";
import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// A body-extracted static alias narrows the calls through its own binding only. A parameter or a
// catch clause of the same name nested in the alias's scope holds another value, so a call through
// it dispatches generically: the static's array helper would hand a string its own missing method.
// The read of the alias itself keeps its narrow.
const from = _Array$from,
  {
    from: _unused,
    ...rest
  } = Array;
export const own = _keysMaybeArray(_ref = from([1, 2])).call(_ref);
export function param(from) {
  var _ref2;
  return _at(_ref2 = from('xy')).call(_ref2, 0);
}
export function caught(error) {
  try {
    throw error;
  } catch (from) {
    var _ref3;
    return _includes(_ref3 = from('xy')).call(_ref3, 'x');
  }
}