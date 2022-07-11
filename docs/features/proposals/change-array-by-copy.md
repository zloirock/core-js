# [Change `Array` by copy](https://github.com/tc39/proposal-change-array-by-copy)
Modules [`esnext.array.to-reversed`](/packages/core-js/modules/esnext.array.to-reversed.js), [`esnext.array.to-sorted`](/packages/core-js/modules/esnext.array.to-sorted.js), [`esnext.array.to-spliced`](/packages/core-js/modules/esnext.array.to-spliced.js), [`esnext.array.with`](/packages/core-js/modules/esnext.array.with.js), [`esnext.typed-array.to-reversed`](/packages/core-js/modules/esnext.typed-array.to-reversed.js), [`esnext.typed-array.to-sorted`](/packages/core-js/modules/esnext.typed-array.to-sorted.js), [`esnext.typed-array.to-spliced`](/packages/core-js/modules/esnext.typed-array.to-spliced.js), [`esnext.typed-array.with`](/packages/core-js/modules/esnext.typed-array.with.js).
```ts
class Array {
  toReversed(): Array<mixed>;
  toSpliced(start?: number, deleteCount?: number, ...items: Array<mixed>): Array<mixed>;
  toSorted(comparefn?: (a: any, b: any) => number): Array<mixed>;
  with(index: includes, value: any): Array<mixed>;
}

class %TypedArray% {
  toReversed(): %TypedArray%;
  toSpliced(start?: number, deleteCount?: number, ...items: %TypedArray%): %TypedArray%;
  toSorted(comparefn?: (a: any, b: any) => number): %TypedArray%;
  with(index: includes, value: any): %TypedArray%;
}
```
[*CommonJS entry points:*](/docs/usage.md#commonjs-api)
```
core-js/proposals/change-array-by-copy
core-js(-pure)/actual|full/array(/virtual)/to-reversed
core-js(-pure)/actual|full/array(/virtual)/to-sorted
core-js(-pure)/actual|full/array(/virtual)/to-spliced
core-js(-pure)/actual|full/array(/virtual)/with
core-js/actual|full/typed-array/to-reversed
core-js/actual|full/typed-array/to-sorted
core-js/actual|full/typed-array/to-spliced
core-js/actual|full/typed-array/with
```
[*Examples*](https://is.gd/tVkbY3):
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
