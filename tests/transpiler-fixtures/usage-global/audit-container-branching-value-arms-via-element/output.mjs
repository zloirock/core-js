import "core-js/modules/es.string.raw";
// a BRANCHING container value reaches EVERY arm: the container walk enumerates the arms of a
// ternary or a logical exactly as the bare-alias axis already does, so a hop spelling answers
// what the alias spelling answers at the same reachability. each line picks a static only ONE
// arm carries, so its import can only come from the enumerated arm; distinct method per line.
const c = Math.random() > 0.5;
// an ARRAY slot indexes a branching value like a keyed one does
const inElement = [c ? String : Object, 0];
export const viaElement = inElement[0].raw`x`;