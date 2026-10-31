// firefox 78 ESR baseline - lacks Array.from-async (ES2024) and structuredClone.
// engine-pinned coverage prevents a chrome-only fixture from masking diff in target
// resolution between vendors
const arr = [1, 2, 3];
const flat = arr.flat();
const includes = arr.includes(2);
console.log(flat, includes);
