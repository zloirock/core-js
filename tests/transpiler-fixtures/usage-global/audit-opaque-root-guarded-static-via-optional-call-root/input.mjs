// an OPTIONAL call root of a proven const-bound callee guards like the plain call - the
// callee cannot be undefined, so the call adds no source of undefined
const oc = () => globalThis;
export const viaOptionalCallRoot = oc?.()?.window?.self?.Array.of(13).at(0);
