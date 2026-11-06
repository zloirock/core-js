import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// flat synth-swap, unresolved sibling key still reads the receiver
export function viaParamMixed({
  of,
  customZ
} = function (_ref) {
  return null == _ref ? _ref : {
    of: _Array$of,
    get customZ() {
      return _ref.customZ;
    }
  };
}(_globalThis.window?.Array)) {
  return [of, customZ];
}