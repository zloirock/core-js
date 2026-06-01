import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// instance method on a chained static call off a parenthesised member-expression global
// (`(globalThis.Array).from(...)`): the paren wrapper is peeled and the member global is
// re-resolved so the static return type narrows and the array-specific at variant is
// selected (parity between transformers)
const r = _atMaybeArray(_ref = _Array$from([1])).call(_ref, 0);
export { r };