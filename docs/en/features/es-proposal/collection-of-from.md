---
category: feature
tag:
  - es-proposal
---

# [`.of` and `.from` methods on collection constructors](https://github.com/tc39/proposal-setmap-offrom)

## Modules

- [`esnext.set.of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.of.js)
- [`esnext.set.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.from.js)
- [`esnext.map.of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.of.js)
- [`esnext.map.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.from.js)
- [`esnext.weak-set.of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.weak-set.of.js)
- [`esnext.weak-set.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.weak-set.from.js)
- [`esnext.weak-map.of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.weak-map.of.js)
- [`esnext.weak-map.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.weak-map.from.js)

## Types

```ts
class Set {
  static of(...args: Array<mixed>): Set;
  static from(
    iterable: Iterable<mixed>,
    mapFn?: (value: any, index: number) => any,
    thisArg?: any
  ): Set;
}

class Map {
  static of(...args: Array<[key, value]>): Map;
  static from(
    iterable: Iterable<mixed>,
    mapFn?: (value: any, index: number) => [key: any, value: any],
    thisArg?: any
  ): Map;
}

class WeakSet {
  static of(...args: Array<mixed>): WeakSet;
  static from(
    iterable: Iterable<mixed>,
    mapFn?: (value: any, index: number) => Object,
    thisArg?: any
  ): WeakSet;
}

class WeakMap {
  static of(...args: Array<[key, value]>): WeakMap;
  static from(
    iterable: Iterable<mixed>,
    mapFn?: (value: any, index: number) => [key: Object, value: any],
    thisArg?: any
  ): WeakMap;
}
```

## Entry points

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

## Example

[_Example_](https://goo.gl/mSC7eU):

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
