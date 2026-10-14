import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// A `!` between the links of a static's chain ends nothing: past an absent `window` the probe's `?.`
// short-circuits every link after it - the call on the static and the member past its result, a member
// read off a missing static - through an alias of the realm and through `self` alike. A paren still
// seals, and the read past it is the source's own throw.
declare const list: number[];
declare const parity: (x: number) => number;
const realm = _globalThis;
export const grouped = null == _globalThis.window ? void 0 : _Map$groupBy(list, parity)!.size;
export const entries = null == realm.window ? void 0 : _Object$fromEntries([['a', 1]])!.a;
export const missing = null == _self.window ? void 0 : _Promise.noSuchStatic!.valueOf();
export const sealed = (null == _globalThis.window ? void 0 : _WeakMap.noSuchStatic).toString();