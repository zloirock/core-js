import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// negatives of the branching-static member enumeration: a SHADOWED branch is a local binding,
// not a global (only the Object branch injects); TYPED local receivers resolve no static branch
// (the type-narrowed instance primary stays the only dispatch); an SE-prefixed branch still
// classifies through its tail (usage-global never rewrites, the effect stays in source)
export function shadowed(Map) {
  return (globalThis.cond ? Map : Object).groupBy;
}
const a1 = [1];
const a2 = [2];
export const typedLocals = (globalThis.cond ? a1 : a2).at(-1);
function eff(x) {
  return x;
}
export const seBranch = (globalThis.cond ? (eff(1), Reflect) : Object).ownKeys;
// the canonical walker follows neither a const-alias INIT nor a bound CALLEE to a branching
// value - the member form and the destructure form agree on this boundary (parity, both bail)
const aliasInit = globalThis.cond ? Promise : Map;
export const viaAliasInit = aliasInit.any;
const boundCallee = () => globalThis.cond ? Promise : Map;
export const viaBoundCallee = boundCallee().race;