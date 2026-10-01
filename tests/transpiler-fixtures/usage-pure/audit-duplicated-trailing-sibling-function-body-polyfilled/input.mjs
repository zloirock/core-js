// MULTI-declarator trailing-sibling extraction: a nested instance method binds as a TRAILING declarator
// (`..., m = _m(recv)`) because a preceding statement would TDZ-fault. the cloned receiver carries a
// FUNCTION value whose body references a polyfillable global / makes an instance call - the trailing
// clone must be re-traversed so those substitute (babel once left it raw here, unlike its single-
// declarator path; the node-walk did too). distinct multi-type instance methods per line.
const z = 1, { y: { at: a } } = { y: [() => Map] };
const w = 2, { v: { includes: b } } = { v: [() => [1, 2].flat()] };
export const r = [z, w, a, b];
