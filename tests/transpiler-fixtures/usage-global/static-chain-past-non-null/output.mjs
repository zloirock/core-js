import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.regexp.to-string";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// A `!` between the links of a static's chain hides nothing from usage detection: the static behind the
// probe's `?.` pulls its modules as it would without the assertion, through an alias of the realm and
// through `self` alike, whether a paren seals the chain or not.
declare const list: number[];
declare const parity: (x: number) => number;
const realm = globalThis;
export const grouped = globalThis.window?.Map!.groupBy(list, parity)!.size;
export const entries = realm.window?.Object.fromEntries([['a', 1]])!.a;
// @ts-expect-error a static the constructor lacks is the read under test
export const missing = self.window?.Promise.noSuchStatic!.valueOf();
// @ts-expect-error a static the constructor lacks is the read under test
export const sealed = (globalThis.window?.WeakMap.noSuchStatic).toString();