import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a realm hop spelled by an EFFECT-bearing computed key names the same slot its dotted twin does,
// so a `delete` folding the run lands the run's ROOT binding and the key's effects re-emit ahead
// of it - the landing question is the consumer's, and answered per claim the noisy spelling took
// the hop's own ponyfill where every quiet twin takes the root. a READ off the same hop keeps
// riding that ponyfill: only the delete names a slot rather than reading a value
let c = 0;
delete (c++, _globalThis).a.deletedSlot;
delete _globalThis.a.dottedTwinSlot;
export const readRidesTheHop = (c++, _self).a.readSlot;
export const counted = c;