import _isIterable from "@core-js/pure/actual/is-iterable";
// `s` is imported from a monorepo / vendor-fork alias listed in `additionalPackages`. Without
// honouring that prefix, the core-js source-path filter rejects `my-fork/...` and `s in arr`
// falls through to the bare string-key branch (no `_isIterable` fold). When recognised, `s`
// resolves to Symbol.iterator and folds. Discriminating revert: drop the package -> fold gone
import s from 'my-fork/actual/symbol/iterator';
export const iterable = _isIterable([1, 2, 3]);