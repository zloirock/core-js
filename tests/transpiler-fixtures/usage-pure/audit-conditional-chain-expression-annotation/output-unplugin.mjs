import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// optional chain on a parenthesised nested-member receiver: `(x?.a)?.b.at(0)`.
// type narrowing through `| undefined` doesn't propagate the inner array element type to
// the outer call site, so the rewrite uses the generic `at` polyfill rather than the
// array-specific variant.
declare const x: { a: { b: string[] } } | undefined;
const r = null == (_ref = x?.a) ? void 0 : _at(_ref2 = _ref.b).call(_ref2, 0);
export { r };