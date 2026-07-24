import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// `g` const-aliases the proxy-global `A` BEFORE `A` is reassigned, so `g` permanently holds the
// captured globalThis - the later `A = self` write is dead for `g`. the alias-root walk anchors its
// reassignment-dominance at the alias-read declarator, so the still-live capture resolves and
// `g.Array.from` collapses to the pure static
let A = _globalThis;
const g = A;
A = _self;
_Array$from([1, 2, 3]);