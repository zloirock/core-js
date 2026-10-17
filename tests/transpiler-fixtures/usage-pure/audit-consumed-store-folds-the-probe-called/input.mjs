// Plain reads through a stored realm run retain the consuming collapse, including destructuring after its render.
// An optional continuation preserves the absence of a terminal window probe instead of proving it defined.
// Identifier and proven-call roots keep every sequence and computed-key effect exactly once.
let e = 0;
let held;
export const called = (held = (e++, globalThis.self).window).Array.of(1);
export { e };
export { held };
