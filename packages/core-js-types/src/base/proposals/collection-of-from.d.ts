// https://github.com/tc39/proposal-setmap-offrom

interface MapConstructor {
  /**
   * Creates a new `Map` instance from an iterable or array-like object of [key, value] pairs.
   * Optionally, applies a mapping function to each pair.
   * @param source Iterable or array-like object of [key, value] pairs.
   * @param mapFn Function to call on every [key, value] pair before adding to the `Map`.
   * @param thisArg Value to use as this when executing mapFn.
   * @return A new `Map` instance.
   */
  from<K, V, VOut = V>(source: Iterable<[K, V]>, mapFn?: (value: V, key: K) => VOut, thisArg?: any): Map<K, VOut>;

  /**
   * Creates a new `Map` instance from a variable number of arguments,
   * where each pair of arguments is interpreted as a key and a value.
   * @param items An even number of arguments representing key-value pairs.
   * @return A new `Map` instance.
   */
  of<K, V>(...items: [K, V][]): Map<K, V>;
}

declare var Map: MapConstructor;

interface SetConstructor {
  /**
   * Creates a new `Set` instance from an iterable or array-like object of [key, value] pairs.
   * Optionally, applies a mapping function to each pair.
   * @param source Iterable or array-like object of [key, value] pairs.
   * @param mapFn Function to call on every [key, value] pair before adding to the `Set`.
   * @param thisArg Value to use as this when executing mapFn.
   * @return A new `Set` instance.
   */
  from<T, U = T>(source: Iterable<T>, mapFn?: (value: T, index: number) => U, thisArg?: any): Set<U>;

  /**
   * Creates a new `Set` instance from a variable number of arguments,
   * where each pair of arguments is interpreted as a key and a value.
   * @param items An even number of arguments representing key-value pairs.
   * @return A new `Set` instance.
   */
  of<T>(...items: T[]): Set<T>;
}

declare var Set: SetConstructor;

interface WeakMapConstructor {
  /**
   * Creates a new `WeakMap` instance from an iterable or array-like object of [key, value] pairs.
   * Optionally, applies a mapping function to each pair.
   * @param source Iterable or array-like object of [key, value] pairs.
   * @param mapFn Function to call on every [key, value] pair before adding to the `WeakMap`.
   * @param thisArg Value to use as this when executing mapFn.
   * @return A new `WeakMap` instance.
   */
  from<K extends object, V, VOut = V>(source: Iterable<[K, V]>, mapFn?: (value: V, key: K) => VOut, thisArg?: any): WeakMap<K, VOut>;

  /**
   * Creates a new `WeakMap` instance from a variable number of arguments,
   * where each pair of arguments is interpreted as a key and a value.
   * @param items An even number of arguments representing key-value pairs.
   * @return A new `Weak` instance.
   */
  of<K extends object, V>(...items: [K, V][]): WeakMap<K, V>;
}

declare var WeakMap: WeakMapConstructor;

interface WeakSetConstructor {
  /**
   * Creates a new `WeakSet` instance from an iterable or array-like object of [key, value] pairs.
   * Optionally, applies a mapping function to each pair.
   * @param source Iterable or array-like object of [key, value] pairs.
   * @param mapFn Function to call on every [key, value] pair before adding to the `WeakSet`.
   * @param thisArg Value to use as this when executing mapFn.
   * @return A new `WeakSet` instance.
   */
  from<T extends object, U extends object = T>(source: Iterable<T>, mapFn?: (value: T, index: number) => U, thisArg?: any): WeakSet<U>;

  /**
   * Creates a new `WeakSet` instance from a variable number of arguments,
   * where each pair of arguments is interpreted as a key and a value.
   * @param items An even number of arguments representing key-value pairs.
   * @return A new `WeakSet` instance.
   */
  of<T extends object>(...items: T[]): WeakSet<T>;
}

declare var WeakSet: WeakSetConstructor;
