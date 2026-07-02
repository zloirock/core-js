// a write under a conditional EXPRESSION container runs on one path even though its statement
// placement is unconditional: a ternary branch, a logical operand and an expression-body arrow
// all refuse flow-trust - member reads stay raw. a TEST-position or sequence write evaluates
// whenever the statement runs, so those keep the static narrow
function viaTernary(c) {
  let M;
  c ? ({ Map: M } = globalThis) : 0;
  return typeof M.groupBy;
}
function viaLogical(c) {
  let P;
  c && ({ Promise: P } = globalThis);
  return typeof P.try;
}
let S;
const w = () => ({ Set: S } = globalThis);
export const lazy = [w, typeof S.union];
let T;
(({ Map: T } = globalThis) ? 1 : 2);
export const test = typeof T.groupBy;
let Q;
(0, { Promise: Q } = globalThis);
export const seq = typeof Q.try;
export const r = [viaTernary(true), viaLogical(true)];
