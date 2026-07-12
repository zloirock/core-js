// a for-x head REBINDS the symbol alias (the canonical write scan sees the head on both
// parsers, where only babel records it natively): the keyed read must stay RAW - the
// runtime key is the loop's string, and folding to the iterator-method helper would read
// the well-known symbol instead. the alias INIT still swaps (pre-loop polyfill-wins)
var { iterator } = Symbol;
for (var iterator in { a: 1 }) { void iterator; }
export const raw = obj[iterator];
