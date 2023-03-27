---
category: feature
tag:
  - es-proposal
---

# [`Map.prototype.emplace`](https://github.com/thumbsupep/proposal-upsert)

## Modules

- [`esnext.map.emplace`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.emplace.js)
- [`esnext.weak-map.emplace`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.weak-map.emplace.js)

## Types

```ts
interface Map<K, V> {
  emplace<T, U>(
    key: any,
    handler: {
      update: (value: V, key: K, target: Map<K, V>) => T;
      insert: (key: K, target: Map<K, V>) => U;
    }
  ): T | U;
}

interface WeakMap<K extends object, V> {
  emplace<T, U>(
    key: any,
    handler: {
      update: (value: V, key: K, target: WeakMap<K, V>) => T;
      insert: (key: K, target: WeakMap<K, V>) => U;
    }
  ): T | U;
}
```

## Entry points

```
core-js/proposals/map-upsert-stage-2
core-js(-pure)/full/map/emplace
core-js(-pure)/full/weak-map/emplace
```

## Example

[_Example_](https://is.gd/ty5I2v):

```js
const map = new Map([["a", 2]]);

map.emplace("a", { update: (it) => it ** 2, insert: () => 3 }); // => 4

map.emplace("b", { update: (it) => it ** 2, insert: () => 3 }); // => 3

console.log(map); // => Map { 'a': 4, 'b': 3 }
```
