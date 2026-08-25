// WHICH receivers an instance slot may spell is ONE gate in the core: a re-referenceable root, a
// single-prop pattern for a member read, and no raw global riding inside (the synth re-emits the
// receiver verbatim once the natural visitor is gone). a SELECTING receiver hands the destructure one
// of its PARTS, so it is admissible exactly when every part is - asked recursively, parts peeled the
// way every other receiver question peels them. the INSTANCE render then spells the selection WHOLE,
// because the arm is chosen at runtime: the ctor rule that reads a fallback through its LEFT answers a
// different question, and using it here handed the helper the dead arm (`_atMaybeArray(nul)`)
const arr = [1, [2]];
const arr2 = [3, [4]];
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

// ... and so does a part with an EFFECT - the synth spells the receiver once per entry
export const log = [];
export const viaEffectArm = (function ({ at } = nul || (log.push('x'), arr)) {
  return typeof at;
})();

// controls: the shapes the gate DOES admit still swap - a bare binding at any prop count, and a
// side-effect-free member read at a single prop
export const viaBinding = (function ({ at } = arr) {
  return typeof at;
})();
export const viaMemberSingleProp = (function ({ at } = arr2) {
  return typeof at;
})();
