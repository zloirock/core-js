import _getIterator from "@core-js/pure/actual/get-iterator";
// `recv[Symbol.iterator]()` with receiver-side SequenceExpression `(fnRuns++,
// [1,2,3])`. the receiver SE survives at the AST level: the call rewrite keeps
// `path.node.object` as the argument of the `_getIterator(...)` rewrite, so
// the SequenceExpression evaluates normally during argument resolution. the
// symbol-iterator handler ALSO threads a `sideEffects` parameter through as
// defensive plumbing - meta.sideEffects stays empty for the symbol-iterator
// dispatch today because computed-symbol-key resolve early-returns ahead of
// member-meta's SE collection, but the path is wired so future extensions
// don't silently drop SE
let fnRuns = 0;
const r = _getIterator((fnRuns++, [1, 2, 3]));