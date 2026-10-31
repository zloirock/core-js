// instance method on a chained static call off a parenthesised member-expression global
// (`(globalThis.Array).from(...)`): the paren wrapper is peeled and the member global is
// re-resolved so the static return type narrows and the array-specific at variant is
// selected (parity between transformers)
const r = (globalThis.Array).from([1]).at(0);
export { r };
