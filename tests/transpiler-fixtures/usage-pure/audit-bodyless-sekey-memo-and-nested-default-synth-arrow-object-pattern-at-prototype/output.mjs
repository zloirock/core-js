import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const cond = true;
// negative: with no SE key and a quiet init the slot keeps its single statement, no memo
export const a5 = (() => {
  if (cond) var at = _atMaybeArray(Array.prototype);
  return typeof at;
})();
export const r = [a5];