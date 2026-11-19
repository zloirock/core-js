import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// the SE-tail peel reaches the inner receiver; the prefix effect stays in place and runs once
export const viaSeTailArg = (_ref => {
  let flat = _flatMaybeArray(_ref);
  return flat;
})((mark(), [3, [4]]));