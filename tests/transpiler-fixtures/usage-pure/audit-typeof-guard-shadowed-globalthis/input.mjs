// user-shadowed `globalThis` parameter must defeat the instanceof guard's globalProxyMemberName
// resolution. `x instanceof globalThis.Array` reads `Array` off the LOCAL `globalThis` param,
// not the real global - so the runtime type of `x` is opaque and `.at` must NOT specialize
// to `_atMaybeArray`. without scope threading on globalProxyMemberName, the shadow goes
// undetected and the Array narrow fires incorrectly, picking the array-specific dispatch
function pick(x: unknown, globalThis: { Array: any }) {
  if (x instanceof globalThis.Array) {
    return x.at(0);
  }
  return null;
}
