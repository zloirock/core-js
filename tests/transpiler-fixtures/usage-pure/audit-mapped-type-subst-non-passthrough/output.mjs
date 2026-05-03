import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// non-trivial mapped body with `T[K] | null` union: `Box<T> = { [K in keyof T]: T[K] | null }`.
// no `as` rename - identity rename branch in `expandMappedTypeMembers` substitutes K into
// the body per source member, yielding `string[] | null` for `b.a`. the `?.at(0)` site
// narrows through the optional-chain guard (drops the null arm), so the array-instance
// polyfill emits via `_atMaybeArray`. covers T[K]-substituting body alongside fixed-body
// (`number[]`) and intrinsic-wrapper (`T[K][]`, `Promise<T[K]>`) shapes
type Box<T> = { [K in keyof T]: T[K] | null };
declare const b: Box<{
  a: string[];
}>;
null == (_ref = b.a) ? void 0 : _atMaybeArray(_ref).call(_ref, 0);