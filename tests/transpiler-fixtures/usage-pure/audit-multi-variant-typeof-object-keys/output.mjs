import _keys from "@core-js/pure/actual/instance/keys";
// parity check for `.keys()` - same multi-variant typeof-object narrow path as entries.
// asserts the desc.common preference rule applies uniformly across iterator methods that
// have both `array` and `domcollection` type-specific variants.
function f(x) {
  if (typeof x === "object") _keys(x).call(x);
}