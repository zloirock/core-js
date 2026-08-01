import _globalThis from "@core-js/pure/actual/global-this";
import _entries from "@core-js/pure/actual/instance/entries";
import _keys from "@core-js/pure/actual/instance/keys";
import _Map from "@core-js/pure/actual/map/constructor";
// a MUTATED `self` slot deopts the sealed probe forms FILE-WIDE (the slot write makes every
// `self` read the user's replacement): the synth default, the claim and the destructure all
// keep the raw sealed read - substituting a pony would bypass the mutation. isolated file:
// the deopt is file-scoped by design, and would kill probe fixtures sharing the module
_globalThis.self = _globalThis.self;
export function viaSealedMutatedSynth({
  getPrototypeOf: dm1
} = (_globalThis.window?.self).Object) {
  return dm1;
}
export const viaSealedMutatedClaim = _keys((_globalThis.window?.self).Object);
export const viaSealedMutatedDestructure = _entries((_globalThis.window?.self).Object);

// every OTHER channel deopts the same way: proto-method call (the unmutated `Map` argument
// still claims), fallback static, kept-assign, delete - raw sealed read, substituted root
export const viaSealedMutatedProto = (_globalThis.window?.self).Map.prototype.has.call(new _Map(), 1);
export const viaSealedMutatedFallback = (_globalThis.window?.self).Promise.noSuchStatic;
let d;
export const viaSealedMutatedKept = (d = _globalThis.window?.self).Array;
export const viaSealedMutatedDelete = delete (_globalThis.window?.self).customProp;