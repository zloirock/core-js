import _isIterable from "@core-js/pure/actual/is-iterable";
// `s` is imported from a monorepo / vendor-fork alias listed in `additionalPackages`.
// Without the user-package prefix check in `bindingSymbolKey`, the regex-only filter
// `CORE_JS_SOURCE_PREFIX` rejects `my-fork/...` paths and `s in arr` falls through
// to the bare string-key branch (no `_isIterable` fold). With the fix, `s` is
// recognised as Symbol.iterator, the binary-in expression folds to a polyfill call.
// Discriminating revert: drop adapter.packages → fold disappears
import s from 'my-fork/actual/symbol/iterator';
export const iterable = _isIterable([1, 2, 3]);