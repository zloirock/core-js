import _Promise from "@core-js/pure/actual/promise/constructor";
function pick(x) {
  return x;
}
// negative: an OPAQUE call root proves nothing about its return value, so the static is not claimed
// and the navigation stays exactly as written - only the argument, which survives, is rewritten
export const opaqueRoot = _Promise.self.Array.of(7);