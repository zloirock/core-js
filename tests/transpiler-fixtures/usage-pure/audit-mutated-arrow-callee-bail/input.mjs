// reassigned `let` / `var` arrow callees: `f = () => Map; f = () => Set; f()` - the
// receiver's static type is no longer decidable, so static-method polyfills must NOT
// fire. instance dispatch may still emit via the maybe-variant fallback path
let f = () => Map;
f = () => Set;
const a = f().has(1);
var g = () => Promise;
g = () => Map;
const b = g().has(2);
export { a, b };
