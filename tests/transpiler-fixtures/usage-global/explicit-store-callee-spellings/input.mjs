// an explicit store writes a container slot whatever spelling its callee takes - a destructured
// method, an alias, the pure import a prior pass mints, `.call`, `Reflect.apply`: a pattern read of
// the slot reaches the stored constructor
import _Reflect$set from '@core-js/pure/actual/reflect/set';
const { assign } = Object;
const define = Reflect.defineProperty;
const a = { M: Math };
assign(a, { M: Array });
const { M: A } = a;
export const viaDestructured = A.from(src);
const b = { M: Math };
define(b, 'M', { value: Object });
const { M: B } = b;
export const viaAlias = B.groupBy(src, x => x);
const c = { M: Math };
_Reflect$set(c, 'M', Number);
const { M: C } = c;
export const viaPureImport = C.isInteger(src);
const d = { M: Math };
Reflect.set.call(null, d, 'M', String);
const { M: D } = d;
export const viaCall = D.fromCodePoint(src);
const e = { M: Math };
Reflect.apply(Object.defineProperty, null, [e, 'M', { value: Promise }]);
const { M: E } = e;
export const viaApply = E.allSettled(src);
