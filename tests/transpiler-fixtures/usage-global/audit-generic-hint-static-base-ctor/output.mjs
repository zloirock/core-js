import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.function.name";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a bare constructor read resolved through a GENERIC hint (`.name` -> es.function.name) injects
// nothing that guarantees the RECEIVER global itself - the base constructor must come alongside,
// else the read throws off-engine before the generic polyfill matters. isolates the
// base-constructor direction: proxy-hop fixtures reach the ctor via the hop's own value meta and
// would pass without it
export const n = Promise.name;
export const l = Map.length;