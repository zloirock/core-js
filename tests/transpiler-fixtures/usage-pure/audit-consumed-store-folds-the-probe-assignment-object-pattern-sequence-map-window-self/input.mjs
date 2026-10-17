// Plain reads through a stored realm run retain the consuming collapse, including destructuring after its render.
// An optional continuation preserves the absence of a terminal window probe instead of proving it defined.
// Identifier and proven-call roots keep every sequence and computed-key effect exactly once.
let e = 0;
let held;
// ... and its assignment-PATTERN twin, whose slots come off the same folded value: the lift
// re-emits the write verbatim, so the effect inside the run rides along with it
let Assigned;
({ Map: Assigned } = (held = (e++, globalThis.self).window));
export { e };
export { held };
export { Assigned };
