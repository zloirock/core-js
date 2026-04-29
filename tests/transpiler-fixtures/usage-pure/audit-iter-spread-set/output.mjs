import _Set from "@core-js/pure/actual/set/constructor";
// `new Set([...iter])` Set built from spread: both Set constructor and the iteration
// protocol must be polyfilled.
const a = [...new _Set()];