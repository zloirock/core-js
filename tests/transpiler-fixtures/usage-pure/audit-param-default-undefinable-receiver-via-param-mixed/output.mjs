import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// flat synth-swap, unresolved sibling key still reads the receiver
export function viaParamMixed({
  of,
  customZ
} = {
  of: _Array$of,
  customZ: (_globalThis.window?.Array).customZ
}) {
  return [of, customZ];
}