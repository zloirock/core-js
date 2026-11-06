import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Reflect$construct from "@core-js/pure/actual/reflect/construct";
// `Reflect.construct(C, args)` is structurally equivalent to `new C(...args)` and yields a `C` instance.
// Class-context resolution must recognise it so member access narrows through the class body.
class Box {
  fetchItems() {
    return [1, 2, 3];
  }
}
const inst = _Reflect$construct(Box, []);
const arr = inst.fetchItems();
const head = _atMaybeArray(arr).call(arr, 0);
export { head };