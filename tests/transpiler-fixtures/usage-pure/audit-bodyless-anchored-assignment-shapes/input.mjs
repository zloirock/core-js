// Bodyless assignments retain their receiver and assignment result.
// Missing pristine constructors use pure bindings; unknown members remain residual reads.
let custom1, custom2, r, g;
if (c1()) ({ Map: { custom: custom1 } } = globalThis);
if (c2()) ({ Promise: { custom: custom2, ...r } } = globalThis);
if (c3()) ({ Iterator: { zip: g, customI } } = globalThis);
console.log(custom1, custom2, r, g);
