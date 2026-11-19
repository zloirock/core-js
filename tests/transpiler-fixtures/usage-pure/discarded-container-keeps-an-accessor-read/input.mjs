// A literal container retains accessor reads in otherwise unused sibling values.
// Native nested statics do not justify dropping construction effects.
const log = [];
const { w: { from: besideSibling } } = { w: Array, s: { get g() { log.push('sibling'); return 1; } }.g };
// A plain data member adds no accessor effect to the native wrapper read.
const { w: { from: plainSlot } } = { w: { w: Array }.w };
export { besideSibling, plainSlot, log };
