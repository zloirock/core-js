import _at from "@core-js/pure/actual/instance/at";
import _Array$from from "@core-js/pure/actual/array/from";
// combined shape: IIFE arrow with destructured param where the receiver is `Array`
// (call argument substituted with the polyfilled binding), body uses `from([...])`
// from the destructure, outer optional chain on the call result guards the inner `.at(0)`
(({
  from
}) => {
  var _ref;
  return null == (_ref = from([1, 2])) ? void 0 : _at(_ref).call(_ref, 0);
})({
  from: _Array$from
});