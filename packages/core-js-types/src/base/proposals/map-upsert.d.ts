// https://github.com/tc39/proposal-upsert

interface Map<K, V> { // @type-options: no-redefine
  /**
   * Gets the value for the given key. If the key does not exist, inserts the provided value and returns it.
   * @param key - The key to look up.
   * @param value - The value to insert if the key does not exist.
   * @returns The existing or inserted value.
   */
  getOrInsert(key: K, value: V): V;

  /**
   * Gets the value for the given key. If the key does not exist,
   * computes the value using the provided callback function, inserts it, and returns it.
   * @param key - The key to look up.
   * @param callbackFn - A function that computes the value to insert if the key does not exist.
   * @returns The existing or computed and inserted value.
   */
  getOrInsertComputed<R extends V>(key: K, callbackFn: (key: K) => R): R;
}

interface WeakMap<K extends WeakKey, V> { // @type-options: no-redefine
  /**
   * Gets the value for the given key. If the key does not exist, inserts the provided value and returns it.
   * @param key - The key to look up.
   * @param value - The value to insert if the key does not exist.
   * @returns The existing or inserted value.
   */
  getOrInsert(key: K, value: V): V;

  /**
   * Gets the value for the given key. If the key does not exist,
   * computes the value using the provided callback function, inserts it, and returns it.
   * @param key - The key to look up.
   * @param callbackFn - A function that computes the value to insert if the key does not exist.
   * @returns The existing or computed and inserted value.
   */
  getOrInsertComputed<R extends V>(key: K, callbackFn: (key: K) => R): R;
}
