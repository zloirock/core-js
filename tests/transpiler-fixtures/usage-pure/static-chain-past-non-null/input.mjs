// A `!` between the links of a static's chain ends nothing: past an absent `window` the probe's `?.`
// short-circuits every link after it - the call on the static and the member past its result, a member
// read off a missing static - through an alias of the realm and through `self` alike. A paren still
// seals, and the read past it is the source's own throw.
declare const list: number[];
declare const parity: (x: number) => number;
const realm = globalThis;
export const grouped = globalThis.window?.Map!.groupBy(list, parity)!.size;
export const entries = realm.window?.Object.fromEntries([['a', 1]])!.a;
// @ts-expect-error a static the constructor lacks is the read under test
export const missing = self.window?.Promise.noSuchStatic!.valueOf();
// @ts-expect-error a static the constructor lacks is the read under test
export const sealed = (globalThis.window?.WeakMap.noSuchStatic).toString();
