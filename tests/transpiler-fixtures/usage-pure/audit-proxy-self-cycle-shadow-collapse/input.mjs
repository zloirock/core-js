// A self-referential PROXY-name binding (`var self = self` / `var globalThis = globalThis`) keeps the name
// resolving to the proxy global - the node-only natural rewrite already turns it into `_self` / `_globalThis`,
// so the cycle-guard falls back to the node NAME and the redundant proxy hop collapses CONSISTENTLY in both
// emitters (unplugin has no AST re-visit to recover it), not a residual `_self.window.Array` reading an
// undefined hop off-engine. distinct ctors / statics; a non-proxy self-cycle (`var Map = Map`) stays a plain
// ctor swap - the no-over-collapse control.
var self = self;
const sliced = new self.window.Array(3);
var globalThis = globalThis;
const isArr = globalThis.self.Array.isArray([1]);
var Map = Map;
const m = new Map([['k', 1]]);
export { sliced, isArr, m };