// Plain reads through a stored realm run retain the consuming collapse, including destructuring after its render.
// An optional continuation preserves the absence of a terminal window probe instead of proving it defined.
// Identifier and proven-call roots keep every sequence and computed-key effect exactly once.
let e = 0;
let held;
// ... a `delete` reads nothing over its own navigation, but it does read THROUGH the store below
// it - and only a CUSTOM slot is deleted here, so no realm hop of the file deopts
export const deleted = delete (held = (e++, globalThis.self).window).customDeleteSlot;
export { e };
export { held };
