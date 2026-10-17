// A stored navigation value keeps assignments and rewrites inside its sequence prefix.
// Parenthesized and unparenthesized values collapse to the same backed navigation leaf.
// Source optional checks remain observable; plain middle hops do not invent new guards.
let q;
// A plain terminal navigation hop folds onto the deepest backed leaf when consumed.
// Mid-chain stores retain their assignment order.
export const bareUnresolvableTail = (q = globalThis.self.window).Map.name;
