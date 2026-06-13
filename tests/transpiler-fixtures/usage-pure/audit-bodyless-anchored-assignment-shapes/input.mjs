// anchored assignment renders on unbraced control slots: a single-statement render
// (zero-extraction residual, with or without rest) keeps the slot bodyless; a mixed
// extraction + residual render block-wraps
let custom1, custom2, r, g;
if (c1()) ({ Map: { custom: custom1 } } = globalThis);
if (c2()) ({ Promise: { custom: custom2, ...r } } = globalThis);
if (c3()) ({ Iterator: { zip: g, customI } } = globalThis);
console.log(custom1, custom2, r, g);
