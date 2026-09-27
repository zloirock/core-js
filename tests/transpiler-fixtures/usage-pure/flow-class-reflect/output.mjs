import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Reflect$construct from "@core-js/pure/actual/reflect/construct";
var _ref;
// @flow
// Reflect.construct uses the newTarget surface when a third argument is supplied.
declare class B {
  m(): string
}
declare class C {
  m(): number[]
}
_atMaybeArray(_ref = _Reflect$construct(B, [], C).m()).call(_ref, 0);