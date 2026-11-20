import _Array$from from "@core-js/pure/actual/array/from";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Reflect$apply from "@core-js/pure/actual/reflect/apply";
import _Reflect$defineProperty from "@core-js/pure/actual/reflect/define-property";
import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
// an explicit store writes a container slot whatever spelling its callee takes - a destructured
// method, an alias, the pure import a prior pass mints, `.call`, `Reflect.apply`: a pattern read of
// the slot reaches the stored constructor
import _Reflect$set from '@core-js/pure/actual/reflect/set';
const assign = _Object$assign;
const define = _Reflect$defineProperty;
const a = {
  M: Math
};
assign(a, {
  M: Array
});
const {
  M: A
} = a;
export const viaDestructured = _Array$from.call.call(A === Array ? _Array$from : A.from, A, src);
const b = {
  M: Math
};
define(b, 'M', {
  value: Object
});
const {
  M: B
} = b;
export const viaAlias = _Object$groupBy.call.call(B === Object ? _Object$groupBy : B.groupBy, B, src, x => x);
const c = {
  M: Math
};
_Reflect$set(c, 'M', Number);
const {
  M: C
} = c;
export const viaPureImport = _Number$isInteger.call.call(C === Number ? _Number$isInteger : C.isInteger, C, src);
const d = {
  M: Math
};
_Reflect$set.call(null, d, 'M', String);
const {
  M: D
} = d;
export const viaCall = _String$fromCodePoint.call.call(D === String ? _String$fromCodePoint : D.fromCodePoint, D, src);
const e = {
  M: Math
};
_Reflect$apply(_Object$defineProperty, null, [e, 'M', {
  value: _Promise
}]);
const {
  M: E
} = e;
export const viaApply = _Promise$allSettled.call.call(E === _Promise ? _Promise$allSettled : E.allSettled, E, src);