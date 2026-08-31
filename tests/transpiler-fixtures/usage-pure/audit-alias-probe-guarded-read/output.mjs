import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// a read the source already gates on the probe-holding binding owes no probe - the guarded
// branch keeps the byte-clean erase; a function body escapes the gate and keeps the probe
const heldProbe = _globalThis.window;
export const guardedRunRead = heldProbe ? _Array$of(15) : null;
export function guardedFunctionBodyRead() {
  return (heldProbe.Array.of, _Array$of)(16);
}