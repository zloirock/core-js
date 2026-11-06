import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
export const viaNumberArg = (_ref => {
  let toFixed = _toFixedMaybeNumber(_ref);
  return toFixed;
})(1.5);