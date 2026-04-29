import _Array$from from "@core-js/pure/actual/array/from";
// each side of a `||` may be wrapped in TS casts; both branches must be
// unwrapped independently before the polyfill substitution kicks in,
// so a mixed shape (only the left branch cast) still resolves to `Array.from`.
const from = _Array$from;
from([1, 2]);