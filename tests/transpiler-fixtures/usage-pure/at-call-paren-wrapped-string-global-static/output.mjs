import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// instance method on a call of a parenthesised global (`(String)("x")`): the paren wrapper is
// peeled before global resolution so the call return narrows to string and the string-specific
// at variant is selected (parity between transformers)
const r = _atMaybeString(_ref = String("x")).call(_ref, 0);
export { r };