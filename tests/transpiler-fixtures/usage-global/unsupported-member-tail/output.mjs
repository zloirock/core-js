import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An unsupported member tail keeps its receiver and independently visited children.
// Known nested globals, statics and instance calls still request their own entries.
export const ctor = globalThis.Map.unrelatedField;
export const staticLength = Array.from([1, 2]).length;
export const instanceLength = [1, [2]].flat().length;
export const optional = box?.unrelatedField?.(new Set());
export const keyed = box[effect(), Symbol.iterator];
export const callResult = callable.call(receiver, Object.entries({
  x: 1
}));
export const bindResult = callable.bind(receiver, String.fromCodePoint(65));
const C = Promise;
export const prototype = C.prototype;
export const constructor = C.prototype.constructor;