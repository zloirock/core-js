import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/web.dom-collections.iterator";
// the write CHANNELS that make typing treat a namespace as patched. each row patches a DIFFERENT
// namespace so the rows stay attributable: an alias of the namespace, a write through the global
// object, and one through the LOWERED shape a bundler leaves behind (a proxy entry required rather
// than imported - the global object itself). all leave the patched static's result unknown, so the
// receiver keeps the typeless row
var aliased = Object;
aliased.create = replacement;
var fromPatchedCreate = Object.create(Array.prototype);
export const a = fromPatchedCreate.at(0);
globalThis.Array.from = replacement;
export const b = Array.from([1]).includes(2);
var lowered = require("core-js/actual/global-this");
lowered.Map.groupBy = replacement;
export const c = Map.groupBy([1], f).flatMap(g);