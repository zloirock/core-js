import "core-js/modules/es.object.to-string";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A receiver that reaches a BRANCHING static value through SAFE indirection enumerates the same branch statics as the inline form:
// a const-alias init, a bound zero-arg callee (arrow and function declaration), and an alias-of-alias chain all resolve to the
// branching value, so each branch's static dep is injected (usage-global under-inject here broke the reachable branch on old
// engines).
const aliasInit = globalThis.cond ? Promise : Map;
export const viaAliasInit = aliasInit.any;