// proposal stage: 1
// https://github.com/tc39/proposal-setmap-offrom
interface MapConstructor {
  from<K, V, VOut = V>(source: Iterable<[K, V]>, mapFn?: (value: V, key: K) => VOut, thisArg?: any): Map<K, VOut>;

  of<K, V>(...items: [K, V][]): Map<K, V>;
}

interface SetConstructor {
  from<T, U = T>(source: Iterable<T>, mapFn?: (value: T, index: number) => U, thisArg?: any): Set<U>;

  of<T>(...items: T[]): Set<T>;
}

interface WeakMapConstructor {
  from<K extends object, V, VOut = V>(source: Iterable<[K, V]>, mapFn?: (value: V, key: K) => VOut, thisArg?: any): WeakMap<K, VOut>;

  of<K extends object, V>(...items: [K, V][]): WeakMap<K, V>;
}

interface WeakSetConstructor {
  from<T extends object, U extends object = T>(source: Iterable<T>, mapFn?: (value: T, index: number) => U, thisArg?: any): WeakSet<U>;

  of<T extends object>(...items: T[]): WeakSet<T>;
}
