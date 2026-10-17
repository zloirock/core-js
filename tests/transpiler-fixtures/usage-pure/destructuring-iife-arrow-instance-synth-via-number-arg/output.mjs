import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
export const viaNumberArg = ((_ref, _unused = void 0) => {
  let toFixed = _toFixedMaybeNumber(_ref);
  return toFixed;
})(1.5);