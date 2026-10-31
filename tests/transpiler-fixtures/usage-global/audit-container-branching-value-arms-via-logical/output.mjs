import "core-js/modules/es.math.clz32";
// a BRANCHING container value reaches EVERY arm: the container walk enumerates the arms of a
// ternary or a logical exactly as the bare-alias axis already does, so a hop spelling answers
// what the alias spelling answers at the same reachability. each line picks a static only ONE
// arm carries, so its import can only come from the enumerated arm; distinct method per line.
const c = Math.random() > 0.5;
// a LOGICAL fallback is the same reachability, and the fan is recursive over nested arms
const logical = {
  Base: c && Object || (c ? Math : Object)
};
export const viaLogical = logical.Base.clz32(1);