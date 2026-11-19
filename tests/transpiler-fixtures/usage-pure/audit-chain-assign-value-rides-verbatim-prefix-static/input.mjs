// A stored navigation value keeps assignments and rewrites inside its sequence prefix.
// Parenthesized and unparenthesized values collapse to the same backed navigation leaf.
// Source optional checks remain observable; plain middle hops do not invent new guards.
let q;
export const prefixStatic = (q = (Promise.resolve(1), globalThis).self).Map.name;
