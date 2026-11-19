// A container literal is discarded whole by the collapse, so every effect it carries has to run
// once ahead of the extraction. A read off an in-place literal that spells its key as an ACCESSOR
// is such an effect - the read IS the call - but the effect predicate answered that a plain member
// read is pure, so the harvest never saw it and the drop erased the accessor. A sibling slot's read
// is the same claim: it is discarded with the container whether or not the pattern names it.
// The hop forms of this class are runtime rows instead: the two legs reach them by different
// routes, so what they lock is the effect count against native, not a spelling.
const log = [];
const { w: { from: besideSibling } } = { w: Array, s: { get g() { log.push('sibling'); return 1; } }.g };
// NEGATIVE: a plain data slot answers without running anything, so nothing is replayed for it
const { w: { from: plainSlot } } = { w: { w: Array }.w };
export { besideSibling, plainSlot, log };
