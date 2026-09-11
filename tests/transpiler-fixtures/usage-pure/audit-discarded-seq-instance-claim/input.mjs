// an assignment DISCARDED as a non-tail sequence element: nobody reads the value it yields, so the
// position is as free as a statement's, and both legs claim there on the same terms. the rewrite
// lands in the ELEMENT rather than in a statement - reaching for the enclosing statement instead
// replaced whatever the sequence held after this element, dropping the tail the source wrote
let m, taken;
const zd = ((({ Array: { prototype: { flat: m } } } = globalThis)), 7);
taken = zd;
// ... and the tail survives whatever the element renders: a claim consuming its whole pattern, a
// residual left binding beside it, and a rest sibling whose sentinel still hoists its own `var`
let at2, rest2, keep2;
const src2 = [1, 2];
const zr = ((({ at: at2, ...rest2 } = src2)), 8);
const zs = ((({ flat: keep2, other: taken } = { flat: [3], other: 9 })), 10);
export { m, taken, at2, rest2, keep2, zd, zr, zs };
