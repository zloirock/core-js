// A stored navigation value keeps assignments and rewrites inside its sequence prefix.
// Parenthesized and unparenthesized values collapse to the same backed navigation leaf.
// Source optional checks remain observable; plain middle hops do not invent new guards.
let q;
const arr = [1];
const alias = globalThis;
export const nestedBelowAliasSeq = (q = (arr.at(0), alias).window.self).Map.name;
