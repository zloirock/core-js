// A stored navigation value keeps assignments and rewrites inside its sequence prefix.
// Parenthesized and unparenthesized values collapse to the same backed navigation leaf.
// Source optional checks remain observable; plain middle hops do not invent new guards.
let q;
// A plain middle navigation hop reaches the backed leaf without inventing an optional guard.
// Sequence effects remain inside the stored value, and direct and aliased roots agree.
export const nestedBelowValue = (q = globalThis.window.self).Map.name;
