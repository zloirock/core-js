// Each selected receiver evaluates in its own branch; instance reads remain in parameter order.
// Falsy selecting operands retain their value so logical fallbacks choose the same receiver.
const arr = [1, [2]];
const arr2 = [3, [4]];
const cond = true;
export const viaConditional = (function ({ at } = cond ? arr : arr2) {
  return typeof at;
})();
