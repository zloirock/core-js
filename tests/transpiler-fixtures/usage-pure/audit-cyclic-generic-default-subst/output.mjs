import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `Self<T = T[]>` - default value of T references T itself. Used without explicit args
// (`type X = Self`), the substitution recurses T -> T[] -> T[][] - cyclic. The depth
// cap stops the recursion; the member type still resolves through the partial
// substitution, so the polyfill picks the array-specific dispatch
type Self<T = T[]> = {
  x: T;
};
type X = Self;
declare const x: X;
_atMaybeArray(_ref = x.x).call(_ref, 0);