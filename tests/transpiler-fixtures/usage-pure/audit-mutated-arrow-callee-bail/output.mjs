import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
// `let` callee with reassignment - `inlineCallReturnExpression` must bail via
// `binding.constantViolations?.length` because reassignment makes the inline result
// indeterminate. here `f` initially returns Map, then is mutated to return Set; the call
// site's static type is undecidable.
// reading from `f()` cannot map to a fixed receiver - polyfill must NOT inject
// Map.prototype.has or Set.prototype.has for `f().has(1)` (instance dispatch may fire
// because receiver type is unknown via Maybe-variant fallback)
let f = () => _Map;
f = () => _Set;
const a = f().has(1);
// also `var` form - var hoisting allows redeclaration; `constantViolations` should still flag
var g = () => _Promise;
g = () => _Map;
const b = g().has(2);
export { a, b };