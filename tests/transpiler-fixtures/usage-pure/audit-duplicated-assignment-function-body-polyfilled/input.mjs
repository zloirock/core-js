// DUPLICATED receiver in a destructuring-ASSIGNMENT: the destructure assigns m natively, then an
// appended overwrite makes the polyfill win - so the receiver is copied into the overwrite AND kept in
// the in-place destructure. its FUNCTION value's body (a polyfillable global) must substitute in both,
// visitor-driven like babel's clone, not left raw as a global-only walk would.
let m;
({ y: { at: m } } = { y: [() => Map] });
export const out = m;
