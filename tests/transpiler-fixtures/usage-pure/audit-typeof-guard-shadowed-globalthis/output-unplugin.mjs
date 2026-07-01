import _at from "@core-js/pure/actual/instance/at";
// user-shadowed `globalThis` parameter must defeat the instanceof guard's global-proxy member
// resolution. `x instanceof globalThis.Array` reads `Array` off the LOCAL `globalThis` param,
// not the real global - so the runtime type of `x` is opaque and `.at` must NOT specialize
// to `_atMaybeArray`. without scope threading on the global-proxy member resolution, the shadow
// goes undetected and the Array narrow fires incorrectly, picking the array-specific dispatch
function pick(x: unknown, globalThis: { Array: any }) {
  if (x instanceof globalThis.Array) {
    return _at(x).call(x, 0);
  }
  return null;
}