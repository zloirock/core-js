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
