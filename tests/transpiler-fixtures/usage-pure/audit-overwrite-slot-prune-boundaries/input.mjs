// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
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
let rest;
({ Array: { prototype: { fill: other } }, ...rest } = globalThis);
// an ARRAY-wrapped element has no way to drop: pruning the leaf under it would leave `[{}]` behind
[{ Array: { prototype: { flatMap: wrapped } } }] = [globalThis];
// a COMPUTED key is the one part of the pattern the dispatch never re-spells, so the slot is what
// runs it - the legs part on how far that surviving residual COLLAPSES its receiver, which is the
// SE-key channel's own question, not this one's
({ Array: { prototype: { [(effect(), 'includes')]: computed } } } = globalThis);
export { dropped, kept, sibling, other, rest, wrapped, computed, z };
