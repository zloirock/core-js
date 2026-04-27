import _Iterator$from from "@core-js/pure/actual/iterator/from";
// `||` / `??` with unknown capitalized primary + known fallback for a static-only key:
// `MyArray || Iterator` resolving `from`. primary `MyArray.from` doesn't resolve (unknown
// receiver, no instance polyfill for `from`). without falling through to the fallback, the
// `Iterator.from` static polyfill is silently dropped - the standalone `_Iterator` constructor
// import doesn't carry static methods, so runtime `from()` fails when MyArray is falsy.
// resolveLogicalDestructureMeta now gates primary's early-return on `resolveBuiltIn(meta)`
// returning a real polyfill; otherwise tries the fallback and registers it with fromFallback
const {
  from
} = MyArray || {
  from: _Iterator$from
};
from([1, 2, 3]);