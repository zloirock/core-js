// a BRANCHING container value reaches EVERY arm: the container walk enumerates the arms of a
// ternary or a logical exactly as the bare-alias axis already does, so a hop spelling answers
// what the alias spelling answers at the same reachability. each line picks a static only ONE
// arm carries, so its import can only come from the enumerated arm; distinct method per line.
const c = Math.random() > 0.5;
// NEGATIVE: neither arm carries this static, so the key adds no module.
// No other row names these constructors and can mask that absence.
const noStatic = { Base: c ? Number : Boolean };
export const viaNoStatic = noStatic.Base.notAStatic;
