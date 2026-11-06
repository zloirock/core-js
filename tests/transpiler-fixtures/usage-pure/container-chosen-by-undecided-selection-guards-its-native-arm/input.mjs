// an undecided selection of containers leaves the static read off its slot to whichever arm ran: an arm
// that is a native static owner guards its static against the captured slot, and an arm pure swaps whole
// reads its own - through an alias, in a slot, and spelled in place
const aliased = flag ? { C: Map } : { C: Object };
export const viaAlias = () => aliased.C.groupBy([1], x => x);
const inSlot = { C: flag ? Iterator : Array };
export const viaSlot = () => inSlot.C.from([1]);
export const inPlace = () => (flag ? { C: Reflect } : { C: Object }).C.getPrototypeOf(x);
