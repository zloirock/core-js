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
