// A stored navigation value keeps assignments and rewrites inside its sequence prefix.
// Parenthesized and unparenthesized values collapse to the same backed navigation leaf.
// Source optional checks remain observable; plain middle hops do not invent new guards.
let q;
// negatives: an unparenthesized value has nothing past its end, and a ctor static reached the same
// way keeps the whole shape too
export const bareValue = (q = globalThis.self).Map.name;
