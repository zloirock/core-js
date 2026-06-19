// DUPLICATED receiver path (the residual SURVIVES): a multi-binding destructure extracts a nested
// instance method while a sibling binding keeps the residual alive, so the receiver is BOTH copied into
// the extraction AND kept in place. the receiver carries a FUNCTION value whose body references a
// polyfillable global / makes an instance call - those must substitute in the copy AND the residual
// (visitor-driven, scope-aware), like babel's clone+re-traverse, not left raw as a global-only walk would.
// distinct multi-type instance methods per line so each copy is attributable.
const { y: { at: a }, k } = { y: [() => Map], k: 1 };
const { z: { includes: b }, j } = { z: [() => [1, 2].flat()], j: 2 };
export const r = [a, b, k, j];
