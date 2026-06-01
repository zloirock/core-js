// numeric indexed access on a parenthesised tuple type (`([number[], string])[0]`): the paren
// wrapper passes through tuple element lookup so element 0 (number[]) resolves and the
// array-specific at variant is selected
declare const x: ([number[], string])[0];
const r = x.at(0);
export { r };
