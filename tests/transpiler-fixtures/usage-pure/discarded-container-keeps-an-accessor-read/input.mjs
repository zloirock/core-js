// Accessor reads inside a receiver literal run once even when their values are discarded.
// Unclaimed sibling slots retain their effects beside the mirrored static.
const log = [];
const { w: { from: besideSibling } } = { w: Array, s: { get g() { log.push('sibling'); return 1; } }.g };
// NEGATIVE: a plain data slot answers without running anything, so nothing is replayed for it
const { w: { from: plainSlot } } = { w: { w: Array }.w };
export { besideSibling, plainSlot, log };
