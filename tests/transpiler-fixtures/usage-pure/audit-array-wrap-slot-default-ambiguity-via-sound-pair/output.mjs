import _Set from "@core-js/pure/actual/set/constructor";
// control: a provably-defined pair keeps the pair fold (the slot default is dead)
let fallback = {};
const [{
  Set: C
} = fallback] = [{
  Set: _Set
}];
export const viaSoundPair = new C(soundSeed);