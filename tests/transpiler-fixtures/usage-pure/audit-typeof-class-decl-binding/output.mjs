import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `typeof Helper` resolves to the class declaration itself, so
// ReturnType<typeof Helper.factory> can reach the static method's return type (number[]).
// The result narrows to Array and `.at(0)` emits the Array variant.
class Helper {
  static factory(): number[] {
    return [1, 2, 3];
  }
}
const r: ReturnType<typeof Helper.factory> = [];
_atMaybeArray(r).call(r, 0);