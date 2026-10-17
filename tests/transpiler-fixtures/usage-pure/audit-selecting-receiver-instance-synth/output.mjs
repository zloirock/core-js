import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
// Each selected receiver evaluates in its own branch; instance reads remain in parameter order.
// Falsy selecting operands retain their value so logical fallbacks choose the same receiver.
const arr = [1, [2]];
const arr2 = [3, [4]];
const holder = {
  arr: arr2
};
const nul = null;
const cond = true;
export const viaLogical = function (_ref = nul || arr) {
  let at = _atMaybeArray(_ref);
  return typeof at;
}();
export const viaConditional = function (_ref2 = cond ? arr : arr2) {
  let at = _atMaybeArray(_ref2);
  return typeof at;
}();
export const viaLogicalMultiProp = function (_ref3 = nul || arr) {
  let at = _atMaybeArray(_ref3);
  let flat = _flatMaybeArray(_ref3);
  return typeof at + typeof flat;
}();

// a nested selection is the same question one level down, and a PARENTHESISED arm is the same shape
export const viaNestedSelection = function (_ref4 = cond ? nul || arr : arr2) {
  let at = _atMaybeArray(_ref4);
  return typeof at;
}();

// ... but a part that carries a POLYFILLABLE global still bails the whole selection: the synth would
// re-emit it verbatim past the visitor, and a raw `Iterator` is a ReferenceError off-engine
export const viaGlobalArm = function ({
  map
} = nul || _Iterator.prototype) {
  return typeof map;
}();

// An effect prefix stays ahead of its selected receiver and runs once.
export const log = [];
export const viaEffectArm = function (_ref5 = nul || (_pushMaybeArray(log).call(log, 'x'), arr)) {
  let at = _atMaybeArray(_ref5);
  return typeof at;
}();

// controls: the shapes the gate DOES admit still swap - a bare binding at any prop count, and a
// side-effect-free member read at a single prop
export const viaBinding = function (_ref6 = arr) {
  let at = _atMaybeArray(_ref6);
  return typeof at;
}();
export const viaMemberSingleProp = function (_ref7 = holder.arr) {
  let at = _atMaybeArray(_ref7);
  return typeof at;
}();