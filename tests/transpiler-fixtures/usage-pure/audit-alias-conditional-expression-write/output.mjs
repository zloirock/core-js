import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref4;
// a write under a conditional EXPRESSION container runs on one path even though its statement
// placement is unconditional: a ternary branch, a logical operand and an expression-body arrow
// all refuse flow-trust - member reads stay raw. a TEST-position or sequence write evaluates
// whenever the statement runs, so those keep the static narrow
function viaTernary(c) {
  var _ref;
  let M;
  c ? (_ref = _globalThis, M = _Map, _ref) : 0;
  return typeof (M === _Map ? _Map$groupBy : M.groupBy);
}
function viaLogical(c) {
  var _ref2;
  let P;
  c && (_ref2 = _globalThis, P = _Promise, _ref2);
  return typeof (P === _Promise ? _Promise$try : P.try);
}
let S;
const w = () => {
  var _ref3;
  return _ref3 = _globalThis, S = _Set, _ref3;
};
export const lazy = [w, typeof S.union];
let T;
(_ref4 = _globalThis, T = _Map, _ref4) ? 1 : 2;
export const test = typeof _Map$groupBy;
let Q;
Q = _Promise;
export const seq = typeof _Promise$try;
export const r = [viaTernary(true), viaLogical(true)];