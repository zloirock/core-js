// a missing-able-ctor residual that re-anchors to the pure constructor must NOT swallow a polyfillable
// default nested in a residual leaf: `nested: { customA = [1].at(0) }` keeps `Array.prototype.at`
// reachable by the natural visitor. anchoring would render the residual verbatim and drop `_at` in both
// emitters; a TOP-LEVEL residual default already bails anchoring, the nested one must bail the same way
const { Array: { from }, Set: { union, nested: { customA = [1].at(0) } } } = globalThis;
export { from, union, customA };
