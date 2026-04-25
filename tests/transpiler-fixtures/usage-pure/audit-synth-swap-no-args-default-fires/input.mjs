// IIFE with AssignmentPattern default and no call arguments: caller doesn't supply the
// receiver, so the default expression `Array` is the one that runtime evaluates. synth-swap
// rewrites the default RHS, not the (absent) call argument
const r = (({ from } = Array) => from([1, 2, 3]))();
export { r };
