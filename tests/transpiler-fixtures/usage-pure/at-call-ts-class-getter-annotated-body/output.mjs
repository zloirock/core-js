import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// non-declare class body with explicit getter return-type annotation: ClassMethod path
// (not TSDeclareMethod). return-type extraction must work here too, not just on ambient
// `declare class` signatures
class Bucket<T extends number> {
  #raw: T[] = [] as T[];
  get items(): T[] {
    return this.#raw;
  }
}
const bag = new Bucket<number>();
_atMaybeArray(_ref = bag.items).call(_ref, 0);