// a SEQUENCE evaluates to its last element, so a probe nav sitting there is the receiver's value
// and owes the guard render. by the time the nav's own rewrite runs, the chain ROOT is already
// substituted - the rewrite must still claim the nav under the renamed head rather than skip
// it as a phantom, which is what keeps the ponyfillable hop off a native read here
globalThis.seqBox = { list: ['ab', 'cd'], n: 7 };
let held;
export const seqAssignRootLeaf = ('x', (held = globalThis)?.window?.self).seqBox.list?.at(0);
export { held };
