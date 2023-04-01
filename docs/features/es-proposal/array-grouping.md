---
category: feature
tag:
  - es-proposal
---

# [`Array` grouping](https://github.com/tc39/proposal-array-grouping)

## Modules

- [`esnext.array.group`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.group.js)
- [`esnext.array.group-to-map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.group-to-map.js)

## Types

```ts
interface Array<T> {
  group(
    callbackfn: (value: T, index: number, target: Array<T>) => string | number,
    thisArg?: any
  ): { [index: string]: Array<T> };
  groupToMap(
    callbackfn: (value: T, index: number, target: Array<T>) => string | number,
    thisArg?: any
  ): Map<string | number, Array<T>>;
}
```

## Entry points

```
core-js/proposals/array-grouping-stage-3-2
core-js(-pure)/actual|full/array(/virtual)/group
core-js(-pure)/actual|full/array(/virtual)/group-to-map
```

## Example

[_Example_](https://is.gd/3a0PbH):

```js
[1, 2, 3, 4, 5].group((it) => it % 2); // => { 1: [1, 3, 5], 0: [2, 4] }

const map = [1, 2, 3, 4, 5].groupToMap((it) => it % 2);
map.get(1); // => [1, 3, 5]
map.get(0); // => [2, 4]
```
