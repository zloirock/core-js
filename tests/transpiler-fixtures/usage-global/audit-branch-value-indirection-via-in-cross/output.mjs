import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the `in` carrier crosses reachable KEYS with reachable branch OBJECTS like the member
// form: each key x object pair that names a real static injects, an impossible pair
// (`Map.fromEntries` / `Map.hasOwn`) just resolves to no polyfill
const forInCross = globalThis.cond ? Map : Object;
let inCrossKey = 'fromEntries';
if (globalThis.other) inCrossKey = 'hasOwn';
export const viaInCross = inCrossKey in forInCross;