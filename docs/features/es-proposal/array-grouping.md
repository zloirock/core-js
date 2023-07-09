---
category: feature
tag:
  - es-proposal
---

# [`Array` grouping](https://github.com/tc39/proposal-array-grouping)

## Modules

- [`esnext.object.group-by`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.object.group-by.js)
- [`esnext.map.group-by`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.group-by.js)

## Types

```ts
interface ObjectConstructor {
  groupBy<T>(
    items: Iterable<T>,
    callbackfn: (value: T, index: number) => string | number
  ): { [index: string]: Array<T> };
}
interface MapConstructor {
  groupBy<K, V>(
    items: Iterable<V>,
    callbackfn: (value: V, index: number) => K
  ): Map<K, Array<V>>;
}
```

## Entry points

```
core-js/proposals/array-grouping-v2
core-js(-pure)/full/map/group-by
core-js(-pure)/full/object/group-by
```

## Example

[_Example_](https://is.gd/3a0PbH):

```js
Object.groupBy([1, 2, 3, 4, 5], (it) => it % 2); // => { 1: [1, 3, 5], 0: [2, 4] }
const map = Map.groupBy([1, 2, 3, 4, 5], (it) => it % 2);
map.get(1); // => [1, 3, 5]
map.get(0); // => [2, 4]
```
