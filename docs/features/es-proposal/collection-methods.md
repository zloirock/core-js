---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [New collections methods](https://github.com/tc39/proposal-collection-methods)

## Modules

- [`esnext.set.add-all`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.add-all.js)
- [`esnext.set.delete-all`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.delete-all.js)
- [`esnext.set.every`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.every.js)
- [`esnext.set.filter`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.filter.js)
- [`esnext.set.find`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.find.js)
- [`esnext.set.join`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.join.js)
- [`esnext.set.map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.map.js)
- [`esnext.set.reduce`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.reduce.js)
- [`esnext.set.some`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.some.js)
- [`esnext.map.delete-all`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.delete-all.js)
- [`esnext.map.every`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.every.js)
- [`esnext.map.filter`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.filter.js)
- [`esnext.map.find`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.find.js)
- [`esnext.map.find-key`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.find-key.js)
- [`esnext.map.group-by`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.group-by.js)
- [`esnext.map.includes`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.includes.js)
- [`esnext.map.key-by`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.key-by.js)
- [`esnext.map.key-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.key-of.js)
- [`esnext.map.map-keys`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.map-keys.js)
- [`esnext.map.map-values`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.map-values.js)
- [`esnext.map.merge`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.merge.js)
- [`esnext.map.reduce`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.reduce.js)
- [`esnext.map.some`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.some.js)
- [`esnext.map.update`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.update.js)
- [`esnext.weak-set.add-all`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.weak-set.add-all.js)
- [`esnext.weak-set.delete-all`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.weak-set.delete-all.js)
- [`esnext.weak-map.delete-all`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.weak-map.delete-all.js)

## Types

```ts
interface Set<T> {
  addAll(...args: Array<T>): this;
  deleteAll(...args: Array<T>): boolean;
  every(
    callbackfn: (value: T, key: T, target: Set<T>) => boolean,
    thisArg?: any
  ): boolean;
  filter(
    callbackfn: (value: T, key: T, target: Set<T>) => boolean,
    thisArg?: any
  ): Set<T>;
  find(
    callbackfn: (value: T, key: T, target: Set<T>) => boolean,
    thisArg?: any
  ): T;
  /**@param separator @default "," */
  join(separator: string): string;
  map<U>(
    callbackfn: (value: T, key: T, target: Set<T>) => U,
    thisArg?: any
  ): Set<U>;
  reduce<U>(
    callbackfn: (memo: U, value: T, key: T, target: Set<T>) => U,
    initialValue?: U
  ): U;
  some(
    callbackfn: (value: T, key: T, target: Set<T>) => boolean,
    thisArg?: any
  ): boolean;
}

interface Map<K, V> {
  deleteAll(...args: Array<K>): boolean;
  every(
    callbackfn: (value: V, key: K, target: Map<K, V>) => boolean,
    thisArg?: any
  ): boolean;
  filter(
    callbackfn: (value: V, key: K, target: Map<K, V>) => boolean,
    thisArg?: any
  ): Map<K, V>;
  find(
    callbackfn: (value: V, key: K, target: Map<K, V>) => boolean,
    thisArg?: any
  ): V;
  findKey(
    callbackfn: (value: V, key: K, target: Map<K, V>) => boolean,
    thisArg?: any
  ): K;
  includes(searchElement: V): boolean;
  keyOf(searchElement: V): K;
  mapKeys<L>(
    mapFn: (value: V, index: K, target: Map<K, V>) => L,
    thisArg?: any
  ): Map<L, V>;
  mapValues<W>(
    mapFn: (value: V, index: K, target: Map<K, V>) => W,
    thisArg?: any
  ): Map<K, W>;
  merge(...iterables: Array<Iterable<[K, V]>>): this;
  reduce<T>(
    callbackfn: (memo: T, value: V, key: K, target: Map<K, V>) => T,
    initialValue?: T
  ): T;
  some(
    callbackfn: (value: V, key: K, target: Map<K, V>) => boolean,
    thisArg?: any
  ): boolean;
  update(
    key: K,
    callbackfn: (value: V, key: K, target: Map<K, V>) => V,
    thunk?: (key: K, target: Map<K, V>) => V
  ): this;
}

interface MapConstructor {
  groupBy<K, V>(
    iterable: Iterable<V>,
    callbackfn?: (value: V) => K
  ): Map<K, Array<V>>;
  keyBy<K, V>(iterable: Iterable<V>, callbackfn?: (value: V) => K): Map<K, V>;
}

interface WeakSet<T extends object> {
  addAll(...args: Array<T>): this;
  deleteAll(...args: Array<T>): boolean;
}

interface WeakMap<K extends object, V> {
  deleteAll(...args: Array<K>): boolean;
}
```

## Entry points

```
core-js/proposals/collection-methods
core-js/proposals/collection-of-from
core-js(-pure)/full/set/add-all
core-js(-pure)/full/set/delete-all
core-js(-pure)/full/set/every
core-js(-pure)/full/set/filter
core-js(-pure)/full/set/find
core-js(-pure)/full/set/from
core-js(-pure)/full/set/join
core-js(-pure)/full/set/map
core-js(-pure)/full/set/of
core-js(-pure)/full/set/reduce
core-js(-pure)/full/set/some
core-js(-pure)/full/map/delete-all
core-js(-pure)/full/map/every
core-js(-pure)/full/map/filter
core-js(-pure)/full/map/find
core-js(-pure)/full/map/find-key
core-js(-pure)/full/map/from
core-js(-pure)/full/map/group-by
core-js(-pure)/full/map/includes
core-js(-pure)/full/map/key-by
core-js(-pure)/full/map/key-of
core-js(-pure)/full/map/map-keys
core-js(-pure)/full/map/map-values
core-js(-pure)/full/map/merge
core-js(-pure)/full/map/of
core-js(-pure)/full/map/reduce
core-js(-pure)/full/map/some
core-js(-pure)/full/map/update
core-js(-pure)/full/weak-set/add-all
core-js(-pure)/full/weak-set/delete-all
core-js(-pure)/full/weak-set/of
core-js(-pure)/full/weak-set/from
core-js(-pure)/full/weak-map/delete-all
core-js(-pure)/full/weak-map/of
core-js(-pure)/full/weak-map/from
```
