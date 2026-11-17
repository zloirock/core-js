import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// A retained guard writes the source receiver before the sealed read. A later alias
// may select the polyfill only for the realm value; a user write invalidates that source.
let held;
export const first = ((held = globalThis.window)?.self).Array.from([1]);
export const second = held?.Map;
held = other;
export const changed = held?.Set;