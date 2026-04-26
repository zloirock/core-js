import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// non-ambient class body with an explicit getter return-type annotation `T[]`: the type
// flows through to the call site so `bag.items.at(0)` lands on the array-specific polyfill.
class Bucket<T extends number> {
  #raw: T[] = [] as T[];
  get items(): T[] {
    return this.#raw;
  }
}
const bag = new Bucket<number>();
_atMaybeArray(_ref = bag.items).call(_ref, 0);