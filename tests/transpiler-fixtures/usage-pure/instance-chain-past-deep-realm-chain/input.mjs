// `window` read through a backed realm hop is the realm's self-reference the collapse assumes present,
// so the navigation through it folds whole and keeps no test of its own - however many instance calls
// run past the static it reaches, through an alias of the realm, a sequence or a `typeof` alike. A
// probe read straight off the realm keeps its test.
const realm = globalThis;
let effects = 0;
export const joined = globalThis.self?.window?.Array.from([1, 2]).map(String).join();
export const flatAt = realm.self?.window?.Array.of(1, [2]).flat().at(0);
export const found = (effects++, globalThis.self).window?.Object.values([3]).toSorted().findLast(Boolean);
export const kind = typeof self.self?.window?.Object.getOwnPropertyNames([4]).fill(0).includes;
export const probed = globalThis.window?.self.Object.entries([5, 6]).toReversed().findIndex(Boolean);
