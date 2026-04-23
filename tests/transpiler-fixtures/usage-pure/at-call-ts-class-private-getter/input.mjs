// ClassPrivateMethod kind='get': private-name access follows the same member-resolution
// path, return-type extraction must still fire for `this.#items`
class Store<T extends string> {
  #data: T[] = [] as T[];
  get #items(): T[] { return this.#data; }
  first(): T | undefined { return this.#items.at(0); }
}
new Store<'a' | 'b'>().first();
