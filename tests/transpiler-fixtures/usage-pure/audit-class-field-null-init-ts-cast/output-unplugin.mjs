import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _joinMaybeArray from "@core-js/pure/actual/array/instance/join";
// `(null as any)` and `(null)` - nullish init wrapped in TSAsExpression / paren.
// `isNullishInit` peels these wrappers so `followableVarInit` correctly bails on
// the wrapped nullish init (annotation drives the type instead of the wrapped null).
// without peel, the wrappers hid the nullish-tail from the inference path - downstream
// could pick a non-Maybe variant when the runtime value is actually null
export class A {
  x: number[] = (null as any);
  flat() {
var _ref; return _flatMaybeArray(_ref = this.x).call(_ref); }
}
export class B {
  y: string[] = (null);
  join() {
var _ref2; return _joinMaybeArray(_ref2 = this.y).call(_ref2, ','); }
}