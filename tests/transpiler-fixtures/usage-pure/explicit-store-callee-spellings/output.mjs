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
export const viaDestructured = (A === Array ? _Array$from : A.from.bind(A))(src);
const b = {
  M: Math
};
define(b, 'M', {
  value: Object
});
const {
  M: B
} = b;
export const viaAlias = (B === Object ? _Object$groupBy : B.groupBy.bind(B))(src, x => x);
const c = {
  M: Math
};
_Reflect$set(c, 'M', Number);
const {
  M: C
} = c;
export const viaPureImport = (C === Number ? _Number$isInteger : C.isInteger.bind(C))(src);
const d = {
  M: Math
};
_Reflect$set.call(null, d, 'M', String);
const {
  M: D
} = d;
export const viaCall = (D === String ? _String$fromCodePoint : D.fromCodePoint.bind(D))(src);
const e = {
  M: Math
};
_Reflect$apply(_Object$defineProperty, null, [e, 'M', {
  value: _Promise
}]);
const {
  M: E
} = e;
export const viaApply = (E === _Promise ? _Promise$allSettled : E.allSettled.bind(E))(src);