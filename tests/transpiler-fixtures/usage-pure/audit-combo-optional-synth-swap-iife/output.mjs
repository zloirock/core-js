import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
// combo: IIFE with destructured param + synth-swap on Array receiver + outer optional chain
// on the call result + instance.at polyfill on the optional target
(({
  from
}) => {
  var _ref;
  return null == (_ref = from([1, 2])) ? void 0 : _at(_ref).call(_ref, 0);
})({
  from: _Array$from
});