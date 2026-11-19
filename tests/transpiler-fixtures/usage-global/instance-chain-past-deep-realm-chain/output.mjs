import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.get-own-property-names";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.fill";
import "core-js/modules/es.array.find-index";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.join";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.to-reversed";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// Instance calls past a static read through the realm's self-reference (`self.window`) hide nothing
// from usage detection: the static and every instance method the chain calls pull their modules,
// through an alias of the realm, a sequence or a `typeof` alike, and past a probe read off the realm.
const realm = globalThis;
let effects = 0;
export const joined = globalThis.self?.window?.Array.from([1, 2]).map(String).join();
export const flatAt = realm.self?.window?.Array.of(1, [2]).flat().at(0);
export const found = (effects++, globalThis.self).window?.Object.values([3]).toSorted().findLast(Boolean);
export const kind = typeof self.self?.window?.Object.getOwnPropertyNames([4]).fill(0).includes;
export const probed = globalThis.window?.self.Object.entries([5, 6]).toReversed().findIndex(Boolean);