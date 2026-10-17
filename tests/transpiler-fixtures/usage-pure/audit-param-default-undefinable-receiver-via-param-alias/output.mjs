import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// flat synth-swap, alias-held receiver
const heldCtor = _globalThis.window?.Array;
export function viaParamAlias({
  of
} = {
  of: _Array$of
}) {
  return of;
}