// instance method on a call of a parenthesised global (`(String)("x")`): the paren wrapper is
// peeled before global resolution so the call return narrows to string and the string-specific
// at variant is selected (parity between transformers)
const r = (String)("x").at(0);
export { r };
