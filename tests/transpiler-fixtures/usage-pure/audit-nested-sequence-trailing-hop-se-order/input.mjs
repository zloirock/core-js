// A NESTED sequence proxy receiver with a TRAILING redundant hop (`(c++, (d++, globalThis.self)).window`)
// drops both the in-sequence `.self` and the trailing `.window`, and must harvest the buried prefixes in
// SOURCE evaluation order (c++ before d++). a buried unshift-based walk reversed them (`(d++, c++, ...)`)
// once the trailing hop deepened the chain past a single sequence, so this is a semantic side-effect-ORDER
// lock, not a shape lock. lines vary by nesting DEPTH and trailing-hop COUNT; each binds a DISTINCT method
// and the trailing counters prove every dropped-hop prefix runs in source order.
let a = 0, b = 0, c = 0, d = 0;
const oneHop = (c++, (d++, globalThis.self)).window.Array.prototype.flat.call([1, [2]]);
const twoHops = (c++, (d++, globalThis)).self.window.Array.prototype.at.call([1], 0);
const tripleSeq = (a++, (b++, (c++, globalThis.self))).window.Array.prototype.includes.call([1], 1);
export { oneHop, twoHops, tripleSeq, a, b, c, d };
