---
category: feature
tag:
  - es-proposal
---

# [集合构造器的 `.of` 和 `.from` 方法](https://github.com/tc39/proposal-setmap-offrom)

## 模块

- [`esnext.set.of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.of.js)
- [`esnext.set.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.from.js)
- [`esnext.map.of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.of.js)
- [`esnext.map.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.from.js)
- [`esnext.weak-set.of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.weak-set.of.js)
- [`esnext.weak-set.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.weak-set.from.js)
- [`esnext.weak-map.of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.weak-map.of.js)
- [`esnext.weak-map.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.weak-map.from.js)

## 类型

```ts
interface SetConstructor {
  of<T>(...args: Array<T>): Set<T>;
  from<T, U>(
    iterable: Iterable<T>,
    mapFn?: (value: T, index: number) => U,
    thisArg?: any
  ): Set<U>;
}
interface MapConstructor {
  of<K, V>(...args: Array<[K, B]>): Map<K, V>;
  from<K, V, T>(
    iterable: Iterable<T>,
    mapFn?: (value: T, index: number) => [key: K, value: V],
    thisArg?: any
  ): Map<K, V>;
}

interface WeakSetConstructor {
  of<T extends object>(...args: Array<T>): WeakSet<T>;
  from<T, U extends object>(
    iterable: Iterable<T>,
    mapFn?: (value: T, index: number) => U,
    thisArg?: any
  ): WeakSet<U>;
}

interface WeakMapConstructor {
  of<K extends object, V>(...args: Array<[K, V]>): WeakMap<K, V>;
  from<K extends object, V, T>(
    iterable: Iterable<T>,
    mapFn?: (value: T, index: number) => [key: K, value: V],
    thisArg?: any
  ): WeakMap<K, V>;
}
```

## 入口点

```
core-js/proposals/collection-methods
core-js/proposals/collection-of-from
core-js(-pure)/full/set/from
core-js(-pure)/full/set/of
core-js(-pure)/full/map/from
core-js(-pure)/full/map/of
core-js(-pure)/full/weak-set/of
core-js(-pure)/full/weak-set/from
core-js(-pure)/full/weak-map/of
core-js(-pure)/full/weak-map/from
```

## 示例

[_示例_](https://goo.gl/mSC7eU):

```js
Set.of(1, 2, 3, 2, 1); // => Set {1, 2, 3}

Map.from(
  [
    [1, 2],
    [3, 4],
  ],
  ([key, value]) => [key ** 2, value ** 2]
); // => Map { 1: 4, 9: 16 }
```
