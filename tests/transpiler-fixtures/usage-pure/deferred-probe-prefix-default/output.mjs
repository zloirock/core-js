import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// The default's prefix keeps its nested claims and runs once before the sealed
// read. Passing an argument bypasses both the prefix and the default receiver.
function read({
  of,
  from
} = (() => {
  var _ref;
  return _atMaybeArray(_ref = [7]).call(_ref, 0), (null == _globalThis.window ? void 0 : _self).Array, {
    of: _Array$of,
    from: _Array$from
  };
})()) {
  return [of(3), from([4])];
}
read();
read({
  of: value => [value],
  from: value => value
});