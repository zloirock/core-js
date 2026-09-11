// `new Set([...iter])` Set built from spread: both Set constructor and the iteration
// protocol must be polyfilled.
const a = [...new Set()];
