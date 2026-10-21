import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// An excluded sibling keeps the receiver memo, including its sealed navigation.
// The inner instance claim stays live and the receiver call runs once.
function read({
  of,
  from
} = function (_ref) {
  return {
    of: _ref.of,
    from: _Array$from
  };
}((null == (() => {
  var _ref2;
  _atMaybeArray(_ref2 = [7]).call(_ref2, 0);
  return _globalThis.window;
})() ? void 0 : _self).Array)) {
  return [of(3), from([4])];
}
read();