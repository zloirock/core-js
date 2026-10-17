import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
// A stored navigation value keeps assignments and rewrites inside its sequence prefix.
// Parenthesized and unparenthesized values collapse to the same backed navigation leaf.
// Source optional checks remain observable; plain middle hops do not invent new guards.
let q;
// A plain terminal navigation hop folds onto the deepest backed leaf when consumed.
// Mid-chain stores retain their assignment order.
export const bareUnresolvableTail = _nameMaybeFunction((q = _self, _Map));