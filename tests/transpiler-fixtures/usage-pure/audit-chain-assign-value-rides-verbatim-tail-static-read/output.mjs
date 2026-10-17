import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _self from "@core-js/pure/actual/self";
// A stored navigation value keeps assignments and rewrites inside its sequence prefix.
// Parenthesized and unparenthesized values collapse to the same backed navigation leaf.
// Source optional checks remain observable; plain middle hops do not invent new guards.
let q;
// a static VALUE claim consumes the receiver hops above the assignment, leaving the `=` buried
// under them - the collapse must dig it out the same way the effect prelude does, or the value
// keeps a raw hop only in this claim shape while the ctor-read rows above collapse it
export const tailStaticRead = (q = _self, _Number$MAX_SAFE_INTEGER);