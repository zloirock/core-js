// where the assignment-host OVERWRITE may take its slot with it, and where the slot has to stay. the
// dispatch re-spells the receiver nav the raw pattern read, so a slot with no reader left simply
// drops - and an emptied host drops too. the boundaries below each keep the slot for a reason of
// their own, and the residual then reads the nav BESIDE the dispatch, which is what the receiver
// gate weighs
declare const userNs: {
  Array: {
    prototype: number[];
  };
};
let dropped, kept, sibling, wrapped, computed, other, z;
// the whole chain drops: the statement goes, the dispatch is the only read left
({ Array: { prototype: { copyWithin: dropped } } } = globalThis);
// ... and it drops off a USER namespace too, once the nav goes with it: the source reads
// `userNs.Array.prototype` once, and so does the render
({ Array: { prototype: { flat: kept } } } = userNs);
// a top-level SIBLING keeps the host, not the slot: what it reads is the assignment's own receiver
({ Array: { prototype: { at: sibling } }, z } = globalThis);
// a REST keeps the emptied hop under a sentinel - the rest must go on excluding that key, so the
// residual still reads `globalThis.Array` beside the dispatch
let rest;
({ Array: { prototype: { fill: other } }, ...rest } = globalThis);
// an ARRAY-wrapped element has no way to drop: pruning the leaf under it would leave `[{}]` behind
[{ Array: { prototype: { flatMap: wrapped } } }] = [globalThis];
// a COMPUTED key is the one part of the pattern the dispatch never re-spells, so the slot is what
// runs it - the legs part on how far that surviving residual COLLAPSES its receiver, which is the
// SE-key channel's own question, not this one's
({ Array: { prototype: { [(effect(), 'includes')]: computed } } } = globalThis);
export { dropped, kept, sibling, other, rest, wrapped, computed, z };
