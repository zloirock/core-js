import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _Array$of from "@core-js/pure/actual/array/of";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
// Instance reads preserve receiver, key and default order across host forms.
let k1 = 0;
var _ref = _Promise.prototype ? [7, 8] : [],
  a1 = null == _ref ? _ref[""] : (k1++, _atMaybeArray(_ref)),
  {
    other1
  } = _ref;
export const r1 = [typeof a1, k1];
// logical `||` receiver
let k2 = 0;
const arr2 = [1];
var _ref2 = arr2 || [],
  f2 = null == _ref2 ? _ref2[""] : (k2++, _flatMaybeArray(_ref2)),
  {
    other2
  } = _ref2;
export const r2 = [typeof f2, k2];
// logical `??` receiver
let k3 = 0;
const arr3 = [2];
var _ref3 = arr3 ?? [],
  inc3 = null == _ref3 ? _ref3[""] : (k3++, _includesMaybeArray(_ref3)),
  {
    other3
  } = _ref3;
export const r3 = [typeof inc3, k3];
// logical `&&` receiver
let k4 = 0;
const arr4 = [3],
  arr5 = [4];
var _ref4 = arr4 && arr5,
  fl4 = null == _ref4 ? _ref4[""] : (k4++, _findLastMaybeArray(_ref4)),
  {
    other4
  } = _ref4;
export const r4 = [typeof fl4, k4];
// diverging ternary (user-object branch): Maybe-dispatch keeps the user branch value-correct
let k5 = 0;
const userObj = {
  flatMap: undefined
};
function pick(c) {
  var _ref5 = c ? [5] : userObj,
    fm = null == _ref5 ? _ref5[""] : (k5++, _flatMapMaybeArray(_ref5)),
    {
      other5
    } = _ref5;
  return typeof fm;
}
export const r5 = [pick(true), pick(false), k5];
// A nested branching receiver keeps its selected slot ahead of the key and sibling read.
let k6 = 0;
const _ref7 = {
    y: _Promise.prototype ? [1] : [],
    z6: 1
  },
  {
    y: _ref6
  } = _ref7,
  _ref8 = _ref6,
  v6 = null == _ref8 ? _ref8[""] : (k6++, _valuesMaybeArray(_ref8)),
  {
    z6
  } = _ref7;
export const r6 = [typeof v6, k6, z6];
// A sole property also captures its RHS before the key effect and reads the method once.
let k7 = 0;
var _ref9 = _Promise.prototype ? [9] : [],
  ks7 = null == _ref9 ? _ref9[""] : (k7++, _keysMaybeArray(_ref9));
export const r7 = [typeof ks7, k7];
// A for-init declaration captures its receiver before the key and later declarators.
let k8 = 0,
  out8 = '';
for (var _ref10 = 1 ? [6] : [], e8 = null == _ref10 ? _ref10[""] : (k8++, _entriesMaybeArray(_ref10)), {
    other8
  } = _ref10, i8 = 0; i8 < 1; i8++) out8 = typeof e8;
export const r8 = [out8, k8];
// An opaque initializer is captured where the source evaluates it, so each buried effect
// runs once before the key and property reads.
let k9 = 0,
  calls9 = 0;
function mk9() {
  calls9++;
  return [9];
}
var _ref11 = mk9(),
  a9 = null == _ref11 ? _ref11[""] : (k9++, _atMaybeArray(_ref11)),
  {
    other9
  } = _ref11;
export const r9 = [typeof a9, k9, calls9];
// SE-bearing ternary (an effectful branch value)
let k10 = 0;
var _ref12 = k10 >= 0 ? _Array$of([1]) : [],
  f10 = null == _ref12 ? _ref12[""] : (k10++, _flatMaybeArray(_ref12)),
  {
    other10
  } = _ref12;
export const r10 = [typeof f10, k10];
// A sequence initializer retains its effectful prefix and selected receiver together.
let k11 = 0,
  s11 = 0;
var _ref13 = (s11++, s11 > 0 ? _Array$of(2) : []),
  inc11 = null == _ref13 ? _ref13[""] : (k11++, _includesMaybeArray(_ref13)),
  {
    other11
  } = _ref13;
export const r11 = [typeof inc11, k11, s11];
// effectful computed-member receiver (getter + key effect each fire once)
let g12 = 0;
const holder12 = {
  get p() {
    g12++;
    return [3];
  }
};
var _ref14 = holder12[g12++, 'p'],
  fl12 = null == _ref14 ? _ref14[""] : (g12++, _findLastMaybeArray(_ref14)),
  {
    other12
  } = _ref14;
export const r12 = [typeof fl12, g12];
let k13 = 0;
function mk13() {
  return [7, 8];
}
var {
  [(k13++, 'at')]: a13,
  ...rest13
} = mk13();
export const r13 = [typeof a13, k13, typeof rest13];
// An optional-call initializer is evaluated once before the pattern starts reading it.
let k14 = 0;
const holder14 = {
  get14() {
    return [4];
  }
};
var _ref15 = holder14?.get14?.(),
  f14 = null == _ref15 ? _ref15[""] : (k14++, _flatMaybeArray(_ref15)),
  {
    other14
  } = _ref15;
export const r14 = [typeof f14, k14];
// Proxy navigation collapses inside the captured receiver before its instance read.
let k15 = 0;
var _ref16 = _self.Array.prototype,
  a15 = null == _ref16 ? _ref16[""] : (k15++, _atMaybeArray(_ref16)),
  {
    other15
  } = _ref16;
export const r15 = [typeof a15, k15];
// An effectful sequence prefix stays with the captured navigation receiver and runs once.
let k16 = 0,
  s16 = 0;
var _ref17 = (s16++, _self.Array.prototype),
  f16 = null == _ref17 ? _ref17[""] : (k16++, _flatMaybeArray(_ref17)),
  {
    other16
  } = _ref17;
export const r16 = [typeof f16, k16, s16];
// An exported pattern exposes only its source bindings; generated receiver names stay private.
let k17 = 0;
var _ref18 = holder17.p,
  _u17 = null == _ref18 ? _ref18[""] : (k17++, _toSortedMaybeArray(_ref18)),
  {
    other17
  } = _ref18;
export { _u17, other17 };
export const r17 = [typeof _u17, typeof other17, k17];
// A multi-declarator export preserves binding order and exposes only the source names.
let k18 = 0;
var _ref19 = holder18.p,
  _u18 = null == _ref19 ? _ref19[""] : (k18++, _values(_ref19)),
  {
    other18
  } = _ref19,
  z18 = 1;
export { _u18, other18, z18 };
export const r18 = [typeof _u18, typeof other18, z18, k18];
// A later exported pattern keeps its receiver read after earlier initializers without
// exporting the generated receiver name.
let k19 = 0;
var z19 = 1,
  _ref20 = holder19.p,
  _u19 = null == _ref20 ? _ref20[""] : (k19++, _keys(_ref20)),
  {
    other19
  } = _ref20;
export { z19, _u19, other19 };
export const r19 = [z19, typeof other19, k19];