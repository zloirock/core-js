// reassigned `let` / `var` arrow callees: `f = () => Map; f = () => Set; f()` - the ONE
// unconditional write before the call is the only callee the call can observe, so the receiver
// resolves to what it yields (Set / Map) and its statics polyfill off that; a write the read may
// not observe (conditional, after the call) keeps the receiver undecidable and native
let f = () => Map;
f = () => Set;
const a = f().has(1);
var g = () => Promise;
g = () => Map;
const b = g().has(2);
// NEGATIVE: a conditional write leaves the callee ambiguous - the receiver stays native
let h = () => Map;
if (c) h = () => Set;
const d = h().has(3);
export { a, b, d };
