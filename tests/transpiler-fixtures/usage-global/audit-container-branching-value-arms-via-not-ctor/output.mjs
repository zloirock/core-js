// a BRANCHING container value reaches EVERY arm: the container walk enumerates the arms of a
// ternary or a logical exactly as the bare-alias axis already does, so a hop spelling answers
// what the alias spelling answers at the same reachability. each line picks a static only ONE
// arm carries, so its import can only come from the enumerated arm; distinct method per line.
const c = Math.random() > 0.5;
// NEGATIVE: arms that name no constructor at all contribute no candidate
const local = {
  of: 1
};
const notCtor = {
  Base: c ? local : 42
};
export const viaNotCtor = notCtor.Base.of(1);