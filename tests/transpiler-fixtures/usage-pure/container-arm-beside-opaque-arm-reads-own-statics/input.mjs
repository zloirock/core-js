// a container arm of an undecided selection whose other arm is opaque (`c ? { C: Map } : box`) is no
// selection of containers: nothing mirrors it, pure swaps the constructor in its slot whole, and a static
// read back off that binding - in place, held, through an alias of the slot or a nested pattern - takes
// the entry carrying the constructor's own statics. a slot holding one value serves the read by name
export const inPlace = (c ? { C: Map } : box).C.groupBy;
const held = c ? { P: Promise } : make();
export const viaHeld = held.P.try;
const slot = (w ?? { I: Iterator }).I;
export const viaSlotAlias = slot.from;
export const { W: { S: { for: viaNested } } } = { W: c ? { S: Symbol } : box };
const one = { U: URL };
export const viaOne = one.U.canParse;
