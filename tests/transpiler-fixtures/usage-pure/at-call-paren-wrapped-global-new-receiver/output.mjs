import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// instance method on a `new`-expression off a parenthesised global (`new (Array)(3)`): the
// paren wrapper is peeled before global resolution so the constructed type narrows and the
// array-specific at variant is selected (parity between transformers)
const r = _atMaybeArray(_ref = new Array(3)).call(_ref, 0);
export { r };