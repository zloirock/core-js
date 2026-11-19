// A `||` left decides by the value it holds where the slot is read: a store yields the value it stores,
// so the right never runs; a name a conditional write may null holds no one container, so the right is
// live and its static loads beside the left's.
var stored;
function make() { return { C: Array }; }
export const { C: { from: viaStore } } = (stored = make()) || { C: Iterator };
let held = { C: Map };
if (globalThis.flag) held = null;
export const { C: { groupBy: viaReachedAlias } } = held || { C: Object };
