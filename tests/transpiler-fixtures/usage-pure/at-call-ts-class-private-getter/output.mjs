import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// ClassPrivateMethod kind='get': private-name access follows the same member-resolution
// path, return-type extraction must still fire for `this.#items`
class Store<T extends string> {
  #data: T[] = [] as T[];
  get #items(): T[] {
    return this.#data;
  }
  first(): T | undefined {
    var _ref;
    return _atMaybeArray(_ref = this.#items).call(_ref, 0);
  }
}
new Store<'a' | 'b'>().first();