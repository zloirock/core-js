// extractions of a multi-declarator host stay AT THEIR SOURCE SLOT relative to sibling
// declarators (pre-sibling effects run first, post-sibling after), for full and partial
// consume alike; the surviving declaration splits statement-per-declarator
const a = effA(), { Map: { groupBy } } = globalThis, b = effB();
const c = effC(), { Promise: { try: tryFn, customP } } = globalThis;
console.log(a, groupBy, b, c, tryFn, customP);
