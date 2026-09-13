// Object-rest keeps the affected assignment pattern native and preserves its RHS value.
// Independent reads and key/default expressions still receive their own polyfills.
let custom1, custom2, r, g;
if (c1()) ({ Map: { custom: custom1 } } = globalThis);
if (c2()) ({ Promise: { custom: custom2, ...r } } = globalThis);
if (c3()) ({ Iterator: { zip: g, customI } } = globalThis);
console.log(custom1, custom2, r, g);
