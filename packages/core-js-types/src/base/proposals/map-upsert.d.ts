// https://github.com/tc39/proposal-upsert

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/cdc205d5e6338d96b0fb54657af33d473d480a9c/src/lib/esnext.collection.d.ts#L15
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface Map<K, V> { // @type-options: no-redefine
  /**
   * Returns a specified element from the Map object.
   * If no element is associated with the specified key, a new element with the value `defaultValue` will be inserted into the Map and returned.
   * @param key - The key of the element to return.
   * @param defaultValue - The value to insert if the key is not already associated with an element.
   * @returns The element associated with the specified key, which will be `defaultValue` if no element previously existed.
   */
  getOrInsert(key: K, defaultValue: V): V;
  /**
   * Returns a specified element from the Map object.
   * If no element is associated with the specified key, the result of passing the specified key to the `callback` function will be inserted into the Map and returned.
   * @param key - The key of the element to return.
   * @param callback - A function that computes the value to insert if the key is not already associated with an element. It will be passed the key as an argument.
   * @returns The element associated with the specified key, which will be the newly computed value if no element previously existed.
   */
  getOrInsertComputed(key: K, callback: (key: K) => V): V;
}

interface WeakMap<K extends WeakKey, V> { // @type-options: no-redefine
  /**
   * Returns a specified element from the WeakMap object.
   * If no element is associated with the specified key, a new element with the value `defaultValue` will be inserted into the WeakMap and returned.
   * @param key - The key of the element to return.
   * @param defaultValue - The value to insert if the key is not already associated with an element.
   * @returns The element associated with the specified key, which will be `defaultValue` if no element previously existed.
   */
  getOrInsert(key: K, defaultValue: V): V;
  /**
   * Returns a specified element from the WeakMap object.
   * If no element is associated with the specified key, the result of passing the specified key to the `callback` function will be inserted into the WeakMap and returned.
   * @param key - The key of the element to return.
   * @param callback - A function that computes the value to insert if the key is not already associated with an element. It will be passed the key as an argument.
   * @returns The element associated with the specified key, which will be the newly computed value if no element previously existed.
   */
  getOrInsertComputed(key: K, callback: (key: K) => V): V;
}
