import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// reassigned `let` / `var` arrow callees: `f = () => Map; f = () => Set; f()` - the
// receiver's static type is no longer decidable, so static-method polyfills must NOT
// fire. instance dispatch may still emit via the maybe-variant fallback path
let f = () => _Map;
f = () => _Set;
const a = f().has(1);
var g = () => _Promise;
g = () => _Map;
const b = g().has(2);
export { a, b };