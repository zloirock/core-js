// instance method on a `new`-expression off a parenthesised global (`new (Array)(3)`): the
// paren wrapper is peeled before global resolution so the constructed type narrows and the
// array-specific at variant is selected (parity between transformers)
const r = new (Array)(3).at(0);
export { r };
