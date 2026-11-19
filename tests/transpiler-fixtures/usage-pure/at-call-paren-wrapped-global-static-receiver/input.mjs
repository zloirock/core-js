// instance method on a chained static call off a parenthesised global (`(Array).from(...)`):
// the paren wrapper is peeled before global resolution so the static return type narrows
// and the array-specific at variant is selected (parity between transformers)
const r = (Array).from([1]).at(0);
export { r };
