// non-ambient class body with an explicit getter return-type annotation `T[]`: the type
// flows through to the call site so `bag.items.at(0)` lands on the array-specific polyfill.
class Bucket<T extends number> {
  #raw: T[] = [] as T[];
  get items(): T[] { return this.#raw; }
}
const bag = new Bucket<number>();
bag.items.at(0);
