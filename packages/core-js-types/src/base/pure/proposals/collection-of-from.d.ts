/// <reference types="../core-js-types/map.d.ts" />
/// <reference types="../core-js-types/set.d.ts" />
/// <reference types="../core-js-types/weak-map.d.ts" />
/// <reference types="../core-js-types/weak-set.d.ts" />

// Motivation: import our own Map/Set/WeakMap/WeakSet types & redefine return types

// https://github.com/tc39/proposal-setmap-offrom

declare namespace CoreJS {
  export interface CoreJSMapConstructor extends MapConstructor {
    /**
     * Creates a new `Map` instance from an iterable or array-like object of [key, value] pairs.
     * Optionally, applies a mapping function to each pair.
     * @param source Iterable or array-like object of [key, value] pairs.
     * @param mapFn Function to call on every [key, value] pair before adding to the `Map`.
     * @param thisArg Value to use as this when executing mapFn.
     * @return A new `Map` instance.
     */
    from<K, V, VOut = V>(source: Iterable<[K, V]>, mapFn?: (value: V, key: K) => VOut, thisArg?: any): CoreJS.CoreJSMap<K, VOut>;

    /**
     * Creates a new `Map` instance from a variable number of arguments,
     * where each pair of arguments is interpreted as a key and a value.
     * @param items An even number of arguments representing key-value pairs.
     * @return A new `Map` instance.
     */
    of<K, V>(...items: [K, V][]): CoreJS.CoreJSMap<K, V>;
  }

  var CoreJSMap: CoreJSMapConstructor;

  export interface CoreJSSetConstructor extends SetConstructor {
    /**
     * Creates a new `Set` instance from an iterable or array-like object of [key, value] pairs.
     * Optionally, applies a mapping function to each pair.
     * @param source Iterable or array-like object of [key, value] pairs.
     * @param mapFn Function to call on every [key, value] pair before adding to the `Set`.
     * @param thisArg Value to use as this when executing mapFn.
     * @return A new `Set` instance.
     */
    from<T, U = T>(source: Iterable<T>, mapFn?: (value: T, index: number) => U, thisArg?: any): CoreJS.CoreJSSet<U>;

    /**
     * Creates a new `Set` instance from a variable number of arguments,
     * where each pair of arguments is interpreted as a key and a value.
     * @param items An even number of arguments representing key-value pairs.
     * @return A new `Set` instance.
     */
    of<T>(...items: T[]): CoreJS.CoreJSSet<T>;
  }

  var CoreJSSet: CoreJSSetConstructor;

  export interface CoreJSWeakMapConstructor extends WeakMapConstructor {
    /**
     * Creates a new `WeakMap` instance from an iterable or array-like object of [key, value] pairs.
     * Optionally, applies a mapping function to each pair.
     * @param source Iterable or array-like object of [key, value] pairs.
     * @param mapFn Function to call on every [key, value] pair before adding to the `WeakMap`.
     * @param thisArg Value to use as this when executing mapFn.
     * @return A new `WeakMap` instance.
     */
    from<K extends object, V, VOut = V>(source: Iterable<[K, V]>, mapFn?: (value: V, key: K) => VOut, thisArg?: any): CoreJS.CoreJSWeakMap<K, VOut>;

    /**
     * Creates a new `WeakMap` instance from a variable number of arguments,
     * where each pair of arguments is interpreted as a key and a value.
     * @param items An even number of arguments representing key-value pairs.
     * @return A new `Weak` instance.
     */
    of<K extends object, V>(...items: [K, V][]): CoreJS.CoreJSWeakMap<K, V>;
  }

  var CoreJSWeakMap: CoreJSWeakMapConstructor;

  export interface CoreJSWeakSetConstructor extends WeakSetConstructor {
    /**
     * Creates a new `WeakSet` instance from an iterable or array-like object of [key, value] pairs.
     * Optionally, applies a mapping function to each pair.
     * @param source Iterable or array-like object of [key, value] pairs.
     * @param mapFn Function to call on every [key, value] pair before adding to the `WeakSet`.
     * @param thisArg Value to use as this when executing mapFn.
     * @return A new `WeakSet` instance.
     */
    from<T extends object, U extends object = T>(source: Iterable<T>, mapFn?: (value: T, index: number) => U, thisArg?: any): CoreJS.CoreJSWeakSet<U>;

    /**
     * Creates a new `WeakSet` instance from a variable number of arguments,
     * where each pair of arguments is interpreted as a key and a value.
     * @param items An even number of arguments representing key-value pairs.
     * @return A new `WeakSet` instance.
     */
    of<T extends object>(...items: T[]): CoreJS.CoreJSWeakSet<T>;
  }

  var CoreJSWeakSet: CoreJSWeakSetConstructor;
}
