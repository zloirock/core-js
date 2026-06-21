// DUPLICATED receiver path (the residual SURVIVES): a multi-binding destructure extracts a nested
// instance method while a sibling binding keeps the residual alive, so the receiver is BOTH copied into
// the extraction AND kept in place. the receiver's FUNCTION value references a polyfillable global /
// instance call that must be rewritten in the copy AND the residual (scope-aware, like clone+re-traverse,
// not a raw global-only walk). distinct multi-type instance methods per line so each copy is attributable.
const { y: { at: a }, k } = { y: [() => Map], k: 1 };
const { z: { includes: b }, j } = { z: [() => [1, 2].flat()], j: 2 };
export const r = [a, b, k, j];
