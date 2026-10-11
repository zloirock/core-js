// A `||` left decides by the value it holds where the slot is read. A store yields the value it stores:
// the mirror keeps the store running ahead of the literal. A name a conditional write may null holds no
// one container: the right stays live, and the guard reads the captured slot.
var stored;
function make() { return { C: Array }; }
export const { C: { from: viaStore } } = (stored = make()) || { C: Iterator };
let held = { C: Map };
if (globalThis.flag) held = null;
export const { C: { groupBy: viaReachedAlias } } = held || { C: Object };
