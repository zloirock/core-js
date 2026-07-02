import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a write under a conditional EXPRESSION container runs on one path even though its statement
// placement is unconditional: a ternary branch, a logical operand and an expression-body arrow
// all refuse flow-trust - member reads stay raw. a TEST-position or sequence write evaluates
// whenever the statement runs, so those keep the static narrow
function viaTernary(c) {
  let M;
  c ? {
    Map: M
  } = _globalThis : 0;
  return typeof M.groupBy;
}
function viaLogical(c) {
  let P;
  c && ({
    Promise: P
  } = _globalThis);
  return typeof P.try;
}
let S;
const w = () => ({
  Set: S
} = _globalThis);
export const lazy = [w, typeof S.union];
let T;
({
  Map: T
} = _globalThis) ? 1 : 2;
export const test = typeof _Map$groupBy;
let Q;
0;
Q = _Promise;
export const seq = typeof _Promise$try;
export const r = [viaTernary(true), viaLogical(true)];