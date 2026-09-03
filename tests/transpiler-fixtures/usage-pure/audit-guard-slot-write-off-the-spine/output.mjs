import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// a read is proven to follow an alias write only when the write stands on the always-evaluated
// SPINE of the guard slot: a write in a branch arm of the test, or inside a function body there,
// may never have run when the read does, so the read stays native and throws on the undefined
// alias exactly as the source does. the write on the spine itself keeps proving the read. one
// global per row, so a row that loses its claim loses its own module
var _g;
var _h;
var _i;
export const inArm = (c ? _g = _globalThis : 1) ? _g.Map.groupBy([1], x => x) : 0;
export const inBody = (h = function () {
  _h = _globalThis;
}) ? _h.Object.fromEntries([]) : 0;
export const onSpine = (_i = _globalThis) == null ? void 0 : _Array$of(3);