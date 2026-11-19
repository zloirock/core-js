import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Nested object-pattern with inner RestElement: `rest` is bound inside `{ x: {...rest} }`
// and passed to `Object.keys`. the nested-rest narrow proves `rest` non-primitive, so the
// arg-is-object filter subsumes the `Object.keys` polyfill (no `_Object$keys` import). the
// chain hop into its string[] return still drives `.at(0)` to the Array-specific helper
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