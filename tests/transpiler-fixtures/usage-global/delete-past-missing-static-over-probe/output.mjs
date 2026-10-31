import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
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
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// A `delete` past a static the constructor does not carry, behind the environment probe's `?.`, hides
// nothing from usage detection: each constructor the chain reads on the way pulls its module, through
// an alias of the realm and through `self` alike, past a `!` and past a paren seal.
const realm = globalThis;
// @ts-expect-error a static the constructor lacks is the read under test
export const viaRoot = delete globalThis.window?.Promise.noSuchStatic.slot;
// @ts-expect-error a static the constructor lacks is the read under test
export const viaAlias = delete realm.window?.WeakMap.noSuchStatic?.slot;
// @ts-expect-error a static the constructor lacks is the read under test
export const viaSelf = delete self.window?.Map.noSuchStatic!.slot;
// @ts-expect-error a static the constructor lacks is the read under test
export const sealed = delete (globalThis.window?.Set.noSuchStatic).slot;