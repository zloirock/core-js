import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// A `delete` past a static the constructor does not carry, behind the environment probe's `?.`: the
// probe decides whether the operator acts at all, so the whole delete rides its guard - an absent
// `window` answers `true`, a present one reads the missing static plainly and throws as the source
// does, past a `!` too. A paren ends the chain first, and the read past it throws on the short-circuit.
const realm = _globalThis;
export const viaRoot = null == _globalThis.window ? true : delete _Promise.noSuchStatic.slot;
export const viaAlias = null == realm.window ? true : delete _WeakMap.noSuchStatic?.slot;
export const viaSelf = null == _self.window ? true : delete _Map.noSuchStatic!.slot;
export const sealed = delete (null == _globalThis.window ? void 0 : _Set.noSuchStatic).slot;