// UTF-8 BOM at start + Symbol.iterator in obj rewrite. BOM is stripped, the symbol
// path resolves through `_isIterable`, and the second statement adds `Array.from`.
const x = Symbol.iterator in obj;
const y = Array.from(src);
export { x, y };
