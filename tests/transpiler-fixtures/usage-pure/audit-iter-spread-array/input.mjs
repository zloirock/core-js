// `[...iter]` array spread: the iteration protocol must be polyfilled because spread
// consumes the iterator at runtime.
const a = [...arr];
