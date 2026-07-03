import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
// a side-effect-key instance destructure off a side-effect-free BRANCHING receiver (ternary /
// logical) memoizes the receiver into a `_ref` read once - the branch selects exactly once,
// like the native single read - and extracts the polyfill off the memo. the key effect stays
// in the kept residual key (runs once); Maybe-dispatch keeps a diverging branch value-correct
let k1 = 0;
var _ref = _Promise.prototype ? [7, 8] : [],
  {
    [(k1++, 'at')]: _unused,
    other1
  } = _ref,
  a1 = _atMaybeArray(_ref);
export const r1 = [typeof a1, k1];
// logical `||` receiver
let k2 = 0;
const arr2 = [1];
var _ref2 = arr2 || [],
  {
    [(k2++, 'flat')]: _unused2,
    other2
  } = _ref2,
  f2 = _flatMaybeArray(_ref2);
export const r2 = [typeof f2, k2];
// logical `??` receiver
let k3 = 0;
const arr3 = [2];
var _ref3 = arr3 ?? [],
  {
    [(k3++, 'includes')]: _unused3,
    other3
  } = _ref3,
  inc3 = _includesMaybeArray(_ref3);
export const r3 = [typeof inc3, k3];
// logical `&&` receiver
let k4 = 0;
const arr4 = [3],
  arr5 = [4];
var _ref4 = arr4 && arr5,
  {
    [(k4++, 'findLast')]: _unused4,
    other4
  } = _ref4,
  fl4 = _findLastMaybeArray(_ref4);
export const r4 = [typeof fl4, k4];
// diverging ternary (user-object branch): Maybe-dispatch keeps the user branch value-correct
let k5 = 0;
const userObj = {
  flatMap: undefined
};
function pick(c) {
  var _ref5 = c ? [5] : userObj,
    {
      [(k5++, 'flatMap')]: _unused5,
      other5
    } = _ref5,
    fm = _flatMapMaybeArray(_ref5);
  return typeof fm;
}
export const r5 = [pick(true), pick(false), k5];
// nested branching fragment off a pure init hoists the fragment memo
let k6 = 0;
const _ref6 = _Promise.prototype ? [1] : [];
const v6 = _valuesMaybeArray(_ref6);
const {
  y: {
    [(k6++, 'values')]: _unused6
  },
  z6
} = {
  y: _ref6,
  z6: 1
};
export const r6 = [typeof v6, k6, z6];
// sole-prop pattern memoizes too: the kept key effect still reads the residual, so the
// receiver has two readers (residual + extract) and the memo is the only sound single-read
let k7 = 0;
var _ref7 = _Promise.prototype ? [9] : [];
var ks7 = _keysMaybeArray(_ref7);
var {
  [(k7++, 'keys')]: _unused7
} = _ref7;
export const r7 = [typeof ks7, k7];
// for-init sibling-declarator host takes the memo as a preceding declarator
let k8 = 0,
  out8 = '';
for (var _ref8 = 1 ? [6] : [], {
    [(k8++, 'entries')]: _unused8,
    other8
  } = _ref8, i8 = 0, e8 = _entriesMaybeArray(_ref8); i8 < 1; i8++) out8 = typeof e8;
export const r8 = [out8, k8];
// the memoize channel also takes the WHOLE INIT of a top-level multi-prop pattern when the
// receiver resolves to no single-read-safe node - the memo evaluates exactly where the init
// did, so every buried effect runs once in source order, whatever the expression shape
let k9 = 0,
  calls9 = 0;
function mk9() {
  calls9++;
  return [9];
}
var _ref9 = mk9(),
  {
    [(k9++, 'at')]: _unused9,
    other9
  } = _ref9,
  a9 = _atMaybeArray(_ref9);
export const r9 = [typeof a9, k9, calls9];
// SE-bearing ternary (an effectful branch value)
let k10 = 0;
var _ref10 = k10 >= 0 ? _Array$of([1]) : [],
  {
    [(k10++, 'flat')]: _unused10,
    other10
  } = _ref10,
  f10 = _flatMaybeArray(_ref10);
export const r10 = [typeof f10, k10];
// sequence init with an SE-bearing tail: the memo captures the WHOLE sequence (prefix included)
let k11 = 0,
  s11 = 0;
var _ref11 = (s11++, s11 > 0 ? _Array$of(2) : []),
  {
    [(k11++, 'includes')]: _unused11,
    other11
  } = _ref11,
  inc11 = _includesMaybeArray(_ref11);
export const r11 = [typeof inc11, k11, s11];
// effectful computed-member receiver (getter + key effect each fire once)
let g12 = 0;
const holder12 = {
  get p() {
    g12++;
    return [3];
  }
};
var _ref12 = holder12[g12++, 'p'],
  {
    [(g12++, 'findLast')]: _unused12,
    other12
  } = _ref12,
  fl12 = _findLastMaybeArray(_ref12);
export const r12 = [typeof fl12, g12];
// rest sibling: the kept (renamed) key is read and EXCLUDED from rest like native
let k13 = 0;
function mk13() {
  return [7, 8];
}
var _ref13 = mk13(),
  {
    [(k13++, 'at')]: _unused13,
    ...rest13
  } = _ref13,
  a13 = _atMaybeArray(_ref13);
export const r13 = [typeof a13, k13, typeof rest13];
// optional-call init routes through the same whole-init memo
let k14 = 0;
const holder14 = {
  get14() {
    return [4];
  }
};
var _ref14 = holder14?.get14?.(),
  {
    [(k14++, 'flat')]: _unused14,
    other14
  } = _ref14,
  f14 = _flatMaybeArray(_ref14);
export const r14 = [typeof f14, k14];
// a proxy-hop member receiver collapses INSIDE the memo (the raw hop is undefined off-engine)
let k15 = 0;
var _ref15 = _globalThis.Array.prototype,
  {
    [(k15++, 'at')]: _unused15,
    other15
  } = _ref15,
  a15 = _atMaybeArray(_ref15);
export const r15 = [typeof a15, k15];
// a sequence init whose resolved TAIL sits under an impure prefix retries as the whole init:
// the memo captures prefix and receiver together, effects once in source order
let k16 = 0,
  s16 = 0;
var _ref16 = (s16++, _globalThis.Array.prototype),
  {
    [(k16++, 'flat')]: _unused16,
    other16
  } = _ref16,
  f16 = _flatMaybeArray(_ref16);
export const r16 = [typeof f16, k16, s16];