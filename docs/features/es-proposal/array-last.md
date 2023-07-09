---
category: feature
tag:
  - es-proposal
---

# [Getting last item from `Array`](https://github.com/keithamus/proposal-array-last)

## Modules

- [`esnext.array.last-item`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.last-item.js)
- [`esnext.array.last-index`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.last-index.js)

## Types

```ts
interface Array<T> {
  get lastItem(): T;
  set lastItem(value: T);
  get lastIndex(): number;
}
```

## Entry points

```
core-js/proposals/array-last
core-js/full/array/last-item
core-js/full/array/last-index
```

## Example

[_Example_](https://goo.gl/2TmcMT):

```js
[1, 2, 3].lastItem; // => 3
[1, 2, 3].lastIndex; // => 2

const array = [1, 2, 3];
array.lastItem = 4;

array; // => [1, 2, 4]
```
