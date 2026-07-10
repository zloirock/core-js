// Excluding the iterator helper entries must NOT flip the emit canon: `obj[Symbol.iterator]`
// still collapses to the get-iterator-method helper (the helper wraps native lookups and stays
// correct with its polyfill modules filtered - a raw static-symbol read would diverge from the
// canonical emit and strand proxy-global receivers). a non-helper well-known symbol
// (`Symbol.toStringTag`) keeps the regular static-symbol rewrite, resolving the proxy-global
// KEY (`self.Symbol`) to the imported pure symbol. a proxy-global RECEIVER collapses to the
// pure root inside the helper call.
let obj = {};
const it = obj[globalThis.Symbol.iterator];
const tag = obj[self.Symbol.toStringTag];
const strand = globalThis.self[Symbol.iterator];
// the sibling helper canons survive their entries' exclusion the same way: the zero-arg call
// shape keeps the get-iterator helper, the `in` fold keeps is-iterable
const called = [1][Symbol.iterator]();
const folded = Symbol.iterator in obj;
export { it, tag, strand, called, folded };
