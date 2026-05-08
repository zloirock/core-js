// destructure receiver `globalThis` shares its name with a function parameter in the
// sibling declarator. only the destructure-source identifier should be rewritten when
// the receiver is folded; the inner-function parameter is a distinct local binding
const { Array: { from } } = globalThis, y = (function (globalThis) { return globalThis; })(1);
export { from, y };
