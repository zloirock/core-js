// non-optional `<proxy-global>.<X>.prototype.method(...)` chain. proxy-global root
// at the leaf of the receiver must be polyfilled so `_globalThis.X.prototype.method`
// works on engines without native `globalThis` (ie11) - otherwise the outer call
// rewrite would emit `_method(_ref = globalThis.X.prototype).call(_ref)` verbatim
// and TypeError on the implicit `globalThis.X` lookup. covers the path with no `?.`
globalThis.Array.prototype.flat();
