// IIFE with default-value param and no call arguments: caller doesn't supply the
// receiver, so the default expression `Array` is the one that runtime evaluates. the
// rewrite targets the default RHS instead of the (absent) call argument
const r = (({ from } = Array) => from([1, 2, 3]))();
export { r };
