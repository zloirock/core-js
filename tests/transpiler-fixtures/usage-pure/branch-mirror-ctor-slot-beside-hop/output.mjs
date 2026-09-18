import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set/constructor";
// A prop the pattern reads as a plain CONSTRUCTOR is a SLOT of the branch literal, not a reason to
// decline it: the mirror REPLACES the receiver, so a literal missing that key would answer
// `undefined` where the source read the realm. It rides the hop's literal as the constructor's own
// ponyfill, under a shared proxy step and flat off the branch root alike, and a slot whose level is
// no proxy keeps the whole step - the literal cannot spell a constructor nothing names. What keeps
// the branch alive is the receiver: a fallback that is not the realm, or an arm a TEST selects -
// a selection every arm of which IS the realm names one object and drops instead.
/* eslint-disable no-restricted-globals, unicorn/prefer-global-this -- the bare proxy names are the shape under test */
const grouped = _Map$groupBy;
const SetCtor = _Set;
const flatGrouped = _Map$groupBy;
const FlatSet = _Set;
const box = {
  Map: _Map,
  Set: _Set
};
const {
  Map: {
    groupBy: keptGrouped
  },
  Set: KeptSet
} = null == _globalThis.window ? box : {
  Map: {
    groupBy: _Map$groupBy
  },
  Set: _Set
};
export function pickedArm(c) {
  const {
    Map: {
      groupBy: armGrouped
    },
    Set: ArmSet
  } = c ? {
    Map: {
      groupBy: _Map$groupBy
    },
    Set: _Set
  } : {};
  return [armGrouped, ArmSet];
}
export { grouped, SetCtor, flatGrouped, FlatSet, keptGrouped, KeptSet };