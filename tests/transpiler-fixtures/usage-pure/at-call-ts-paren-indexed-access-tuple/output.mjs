import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// numeric indexed access on a parenthesised tuple type (`([number[], string])[0]`): the paren
// wrapper passes through tuple element lookup so element 0 (number[]) resolves and the
// array-specific at variant is selected
declare const x: ([number[], string])[0];
const r = _atMaybeArray(x).call(x, 0);
export { r };