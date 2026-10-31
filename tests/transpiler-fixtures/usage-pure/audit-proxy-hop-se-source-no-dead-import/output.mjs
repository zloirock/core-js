import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// A lone-prop OBJECT destructure with a pure (no `|| fallback`) SE-sequence init lifts ONLY its SE
// prefix as a statement - the receiver TAIL (`globalThis.self.Array`) is the dropped sequence value,
// never evaluated. so its proxy hop must NOT be collapsed: collapsing would inject a DEAD `_globalThis`
// import for a node that no longer exists in the output. ISOLATED from any `|| fallback` line so the
// ABSENCE of a `_globalThis` import is the assertion. distinct methods so each line's import is clear.
let firstReads = 0;
let secondReads = 0;
firstReads++;
const arrayFrom = _Array$from;
secondReads++;
const arrayOf = _Array$of;
arrayFrom([1]);
arrayOf(2);
export { arrayFrom, arrayOf };