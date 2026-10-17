// Each selected receiver evaluates in its own branch; instance reads remain in parameter order.
// Falsy selecting operands retain their value so logical fallbacks choose the same receiver.
const arr = [1, [2]];
const arr2 = [3, [4]];
const nul = null;
const cond = true;
// a nested selection is the same question one level down, and a PARENTHESISED arm is the same shape
export const viaNestedSelection = (function ({ at } = cond ? (nul || arr) : arr2) {
  return typeof at;
})();
