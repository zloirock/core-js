// a re-referenceable destructure receiver carrying a FUNCTION value feeds a nested instance-method
// extraction. the whole declaration is consumed (sole binding), so the receiver lives only in the
// copy - and its function BODY must be polyfilled like babel's re-traversed clone: a global ref and an
// instance call inside the body both substitute (visitor-driven, scope-aware), not left raw. distinct
// instance methods per declaration so each copy is attributable.
const { y: { at: a } } = { y: [() => Map] };
const { z: { includes: b } } = { z: [() => [1, 2].flat()] };
export const r = [a, b];
