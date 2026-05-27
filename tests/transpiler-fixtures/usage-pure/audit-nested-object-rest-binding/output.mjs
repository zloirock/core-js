import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Nested object-pattern with inner RestElement: `rest` is bound inside the outer
// destructure (`{ x: {...rest} }`) and used as the argument to `Object.keys`. the
// recursive nested-rest narrow resolves `rest` to a provably non-primitive object,
// so the `arg-is-object` filter on `Object.keys` subsumes the polyfill (no
// `_Object$keys` import). the chain hop into `Object.keys`'s string[] return type
// still drives the `.at(0)` call to the Array-specific helper
function pick({
  x: {
    ...rest
  }
}) {
  var _ref;
  return _atMaybeArray(_ref = Object.keys(rest)).call(_ref, 0);
}
pick({
  x: {
    a: 1,
    b: 2
  }
});