import _Iterator$from from "@core-js/pure/actual/iterator/from";
// `||` / `??` with an unknown capitalized primary + known fallback for a static-only key:
// `MyArray || Iterator` resolving `from`. the primary `MyArray.from` does not resolve
// (unknown receiver, no instance polyfill for `from`), and the primary side only takes its
// early return when it resolves to a real polyfill; otherwise the fallback is tried and the
// `Iterator.from` static polyfill ships, so runtime `from()` works when MyArray is falsy
const {
  from
} = MyArray || {
  from: _Iterator$from
};
from([1, 2, 3]);