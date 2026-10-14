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
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// A `delete` through an alias holding the environment probe's value hides nothing from usage
// detection: the constructor each chain reads past the alias's realm hops pulls its family, behind
// the alias's optional link, past a missing static, past a paren seal and in the plain twin alike.
// The realm hops' own modules come with the alias's definition, so each row names a constructor.
const win = globalThis.window;
let late;
late = self.window;
export const viaSelfHop = delete win?.self.Map.slot;
export const viaRealmHop = delete late?.globalThis.Set.slot;
export const viaStatic = delete win?.self.WeakMap.noSuchStatic;
export const sealed = delete (win?.self.Promise).slot;
export const plainTwin = delete win.globalThis.WeakSet.slot;