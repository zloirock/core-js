import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _joinMaybeArray from "@core-js/pure/actual/array/instance/join";
// `(null as any)` and `(null)` - nullish init wrapped in TS as-cast / paren.
// the nullish-init check peels these wrappers so the var-init follower bails on the wrapped
// nullish init and the annotation drives the type instead of the wrapped null.
// peeling exposes the nullish tail to the inference path so downstream picks a
// Maybe variant matching the actual runtime value
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