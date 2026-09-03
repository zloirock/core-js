import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a read is proven to follow an alias write only when the write stands on the always-evaluated
// SPINE of the guard slot: a write in a branch arm of the test, or inside a function body there,
// may never have run when the read does, so the read stays native and throws on the undefined
// alias exactly as the source does. the write on the spine itself keeps proving the read. one
// global per row, so a row that loses its claim loses its own module
var _g;
var _h;
var _i;
export const inArm = (c ? _g = globalThis : 1) ? _g.Map.groupBy([1], x => x) : 0;
export const inBody = (h = function () {
  _h = globalThis;
}) ? _h.Object.fromEntries([]) : 0;
export const onSpine = (_i = globalThis) == null ? void 0 : _i.Array.of(3);