// user parens between the hop and the leaf: the anchor-edge peel sees through them, the
// collapse still owns the span (the wrapper survives as source cosmetics)
let pa;
export const parenBetween = ((pa = globalThis).self)[0];
