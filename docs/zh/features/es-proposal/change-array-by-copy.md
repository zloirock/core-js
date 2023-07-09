---
category: feature
tag:
  - es-proposal
---

# [通过复制来改变 `Array`](https://github.com/tc39/proposal-change-array-by-copy)

## 模块

- [`esnext.array.to-reversed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.to-reversed.js)
- [`esnext.array.to-sorted`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.to-sorted.js)
- [`esnext.array.to-spliced`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.to-spliced.js)
- [`esnext.array.with`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.with.js)
- [`esnext.typed-array.to-reversed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.typed-array.to-reversed.js)
- [`esnext.typed-array.to-sorted`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.typed-array.to-sorted.js)
- [`esnext.typed-array.with`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.typed-array.with.js)

## 类型

```ts
interface Array<T> {
  toReversed(): Array<T>;
  toSpliced(start?: number, deleteCount?: number, ...items: Array<T>): Array<T>;
  toSorted(comparefn?: (a: T, b: T) => number): Array<T>;
  with(index: number, value: T): Array<T>;
}

interface TypedArray {
  toReversed(): TypedArray;
  toSorted(comparefn?: (a: number, b: number) => number): TypedArray;
  with(index: number, value: number): TypedArray;
}
```

## 入口点

```
core-js/proposals/change-array-by-copy
core-js(-pure)/actual|full/array(/virtual)/to-reversed
core-js(-pure)/actual|full/array(/virtual)/to-sorted
core-js(-pure)/actual|full/array(/virtual)/to-spliced
core-js(-pure)/actual|full/array(/virtual)/with
core-js/actual|full/typed-array/to-reversed
core-js/actual|full/typed-array/to-sorted
core-js/actual|full/typed-array/with
```

## 示例

[_示例_](https://is.gd/tVkbY3):

```js
const sequence = [1, 2, 3];
sequence.toReversed(); // => [3, 2, 1]
sequence; // => [1, 2, 3]

const array = [1, 2, 3, 4];
array.toSpliced(1, 2, 5, 6, 7); // => [1, 5, 6, 7, 4]
array; // => [1, 2, 3, 4]

const outOfOrder = [3, 1, 2];
outOfOrder.toSorted(); // => [1, 2, 3]
outOfOrder; // => [3, 1, 2]

const correctionNeeded = [1, 1, 3];
correctionNeeded.with(1, 2); // => [1, 2, 3]
correctionNeeded; // => [1, 1, 3]
```
