// two nested polyfilled-optional segments: the inner `flat?.()?.flatMap(...)` sub-chain becomes the
// receiver of the outer `?.at(...)`. Babel emits a NESTED ternary (the inner sub-chain as the outer
// test's memoized operand); unplugin's text emit flattens every guard into one OR-chain instead.
// semantically identical short-circuit, cosmetic AST-shape divergence -> output-unplugin.mjs
const arr = [[1]];
arr.flat?.()?.flatMap(x => x)?.at(0);
// the SE-keyed POLY optional hop joins the same divergence family; the key SE replays
// between the receiver memo and the dispatch identically on both emitters
arr.flat?.()?.[(eff2(), 'find')](h)?.at(6);
// inner computed-key SE + hop-key SE replay in native order: the receiver memo hoists
// AHEAD of the key effects even under the inner chain's guard
arr[(k1(), 'flat')]?.()[(k2(), 'findLast')](q)?.at(9);
