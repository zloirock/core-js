import _at from "@core-js/pure/actual/instance/at";
// user-shadowed `self` parameter must defeat the instanceof guard's globalProxyMemberName
// resolution. `x instanceof self.Array` reads `Array` off the LOCAL `self` param, not the
// real global - so the runtime type of `x` is opaque and `.at` must NOT specialize to
// `_atMaybeArray`. without scope threading on the global-proxy lookup, the shadow goes
// undetected and the Array narrow fires incorrectly, picking the array-specific dispatch
function pick(x: unknown, self: { Array: any }) {
  if (x instanceof self.Array) {
    return _at(x).call(x, 0);
  }
  return null;
}