import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _Promise from "@core-js/pure/actual/promise/constructor";
// an instance read under an effectful computed key captures its receiver where the source evaluates it, in
// every host - a nested level, a sole property, a for-init, an opaque call, an effectful computed member,
// an optional call - so each effect runs once, ahead of the key and the sibling reads; a rest beside the
// key keeps the whole pattern native
let k6 = 0;
const _ref2 = {
    y: _Promise.prototype ? [1] : [],
    z6: 1
  },
  {
    y: _ref
  } = _ref2,
  v6 = null == _ref ? _ref[""] : (k6++, _valuesMaybeArray(_ref)),
  {
    z6
  } = _ref2;
export const r6 = [typeof v6, k6, z6];
let k7 = 0;
var _ref3 = _Promise.prototype ? [9] : [],
  ks7 = (k7++, _keysMaybeArray(_ref3));
export const r7 = [typeof ks7, k7];
let k8 = 0,
  out8 = '';
for (var _ref4 = [6], e8 = (k8++, _entriesMaybeArray(_ref4)), {
    other8
  } = _ref4, i8 = 0; i8 < 1; i8++) out8 = typeof e8;
export const r8 = [out8, k8];
let k9 = 0,
  calls9 = 0;
function mk9() {
  calls9++;
  return [9];
}
var _ref5 = mk9(),
  a9 = null == _ref5 ? _ref5[""] : (k9++, _atMaybeArray(_ref5)),
  {
    other9
  } = _ref5;
export const r9 = [typeof a9, k9, calls9];
let g12 = 0;
const holder12 = {
  get p() {
    g12++;
    return [3];
  }
};
var _ref6 = holder12[g12++, 'p'],
  fl12 = null == _ref6 ? _ref6[""] : (g12++, _findLastMaybeArray(_ref6)),
  {
    other12
  } = _ref6;
export const r12 = [typeof fl12, g12];
let k13 = 0;
function mk13() {
  return [7, 8];
}
var {
  [(k13++, 'includes')]: a13,
  ...rest13
} = mk13();
export const r13 = [typeof a13, k13, typeof rest13];
let k14 = 0;
const holder14 = {
  get14() {
    return [4];
  }
};
var _ref7 = holder14?.get14?.(),
  f14 = null == _ref7 ? _ref7[""] : (k14++, _flatMaybeArray(_ref7)),
  {
    other14
  } = _ref7;
export const r14 = [typeof f14, k14];