import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Reflect$construct from "@core-js/pure/actual/reflect/construct";
var _ref;
// Without a newTarget argument, `Reflect.construct(C, [])` is just `new C(...)`: the result is a C
// instance, so `C.m`'s `number[]` return drives the array-specific `.at` polyfill. Confirms the
// 2-arg form still resolves from the target (the newTarget branch does not over-trigger).
class C {
  m() {
    return [1, 2, 3];
  }
}
_atMaybeArray(_ref = _Reflect$construct(C, []).m()).call(_ref, 0);