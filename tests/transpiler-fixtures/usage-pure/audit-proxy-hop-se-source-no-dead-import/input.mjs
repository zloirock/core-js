// A lone-prop OBJECT destructure with a pure (no `|| fallback`) SE-sequence init lifts ONLY its SE
// prefix as a statement - the receiver TAIL (`globalThis.self.Array`) is the dropped sequence value,
// never evaluated. so its proxy hop must NOT be collapsed: collapsing would inject a DEAD `_globalThis`
// import for a node that no longer exists in the output. ISOLATED from any `|| fallback` line so the
// ABSENCE of a `_globalThis` import is the assertion. distinct methods so each line's import is clear.
let firstReads = 0;
let secondReads = 0;
const { from: arrayFrom } = (firstReads++, globalThis.self.Array);
const { of: arrayOf } = (secondReads++, globalThis.self.Array);
arrayFrom([1]);
arrayOf(2);
export { arrayFrom, arrayOf };