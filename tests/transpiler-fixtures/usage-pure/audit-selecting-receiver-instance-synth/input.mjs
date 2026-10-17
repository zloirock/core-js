// Each selected receiver evaluates in its own branch; instance reads remain in parameter order.
// Falsy selecting operands retain their value so logical fallbacks choose the same receiver.
const arr = [1, [2]];
const arr2 = [3, [4]];
const holder = { arr: arr2 };
const nul = null;
const cond = true;
export const viaLogical = (function ({ at } = nul || arr) {
  return typeof at;
})();
export const viaConditional = (function ({ at } = cond ? arr : arr2) {
  return typeof at;
})();
export const viaLogicalMultiProp = (function ({ at, flat } = nul || arr) {
  return typeof at + typeof flat;
})();

// a nested selection is the same question one level down, and a PARENTHESISED arm is the same shape
export const viaNestedSelection = (function ({ at } = cond ? (nul || arr) : arr2) {
  return typeof at;
})();

// ... but a part that carries a POLYFILLABLE global still bails the whole selection: the synth would
// re-emit it verbatim past the visitor, and a raw `Iterator` is a ReferenceError off-engine
export const viaGlobalArm = (function ({ map } = nul || Iterator.prototype) {
  return typeof map;
})();

// An effect prefix stays ahead of its selected receiver and runs once.
export const log = [];
export const viaEffectArm = (function ({ at } = nul || (log.push('x'), arr)) {
  return typeof at;
})();

// controls: the shapes the gate DOES admit still swap - a bare binding at any prop count, and a
// side-effect-free member read at a single prop
export const viaBinding = (function ({ at } = arr) {
  return typeof at;
})();
export const viaMemberSingleProp = (function ({ at } = holder.arr) {
  return typeof at;
})();
