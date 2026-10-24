import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// reassigned `let` / `var` arrow callees: `f = () => Map; f = () => Set; f()` - the ONE
// unconditional write before the call is the only callee the call can observe, so the receiver
// resolves to what it yields (Set / Map) and its statics polyfill off that; a write the read may
// not observe (conditional, after the call) keeps the receiver undecidable and native
let f = () => _Map;
f = () => _Set;
const a = _Set.has(1);
var g = () => _Promise;
g = () => _Map;
const b = _Map.has(2);
// NEGATIVE: a conditional write leaves the callee ambiguous - the receiver stays native
let h = () => _Map;
if (c) h = () => _Set;
const d = h().has(3);
export { a, b, d };