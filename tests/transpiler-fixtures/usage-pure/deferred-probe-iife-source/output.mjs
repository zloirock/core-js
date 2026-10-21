import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// The receiver's call stays live until its nested claim has been rewritten.
// Its result is observed once before both keys are extracted.
function read({
  of,
  from
} = ((null == (() => {
  var _ref;
  _atMaybeArray(_ref = [7]).call(_ref, 0);
  return _globalThis.window;
})() ? void 0 : _self).Array, {
  of: _Array$of,
  from: _Array$from
})) {
  return [of(3), from([4])];
}
read();