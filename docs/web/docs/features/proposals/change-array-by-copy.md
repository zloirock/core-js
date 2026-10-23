# Change `Array` by copy
[Specification](https://tc39.es/proposal-change-array-by-copy/)\
[Proposal repo](https://github.com/tc39/proposal-change-array-by-copy)

## Modules
[`es.array.to-reversed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.to-reversed.js), [`es.array.to-sorted`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.to-sorted.js), [`es.array.to-spliced`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.to-spliced.js), [`es.array.with`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.with.js), [`es.typed-array.to-reversed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.to-reversed.js), [`es.typed-array.to-sorted`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.to-sorted.js) and [`es.typed-array.with`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.with.js).

## Built-ins signatures
```ts
class Array {
  toReversed(): Array<mixed>;
  toSpliced(start?: number, deleteCount?: number, ...items: Array<mixed>): Array<mixed>;
  toSorted(comparefn?: (a: any, b: any) => number): Array<mixed>;
  with(index: int, value: any): Array<mixed>;
}

class %TypedArray% {
  toReversed(): %TypedArray%;
  toSorted(comparefn?: (a: any, b: any) => number): %TypedArray%;
  with(index: int, value: any): %TypedArray%;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/change-array-by-copy
core-js(-pure)/es|stable|actual|full/array(/prototype)/to-reversed
core-js(-pure)/es|stable|actual|full/array(/prototype)/to-sorted
core-js(-pure)/es|stable|actual|full/array(/prototype)/to-spliced
core-js(-pure)/es|stable|actual|full/array(/prototype)/with
core-js/es|stable|actual|full/typed-array/to-reversed
core-js/es|stable|actual|full/typed-array/to-sorted
core-js/es|stable|actual|full/typed-array/with
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/change-array-by-copy`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/change-array-by-copy.d.ts)

## Examples
```js
const sequence = [1, 2, 3];
sequence.toReversed(); // => [3, 2, 1]
sequence; // => [1, 2, 3]

const initialArray = [1, 2, 3, 4];
initialArray.toSpliced(1, 2, 5, 6, 7); // => [1, 5, 6, 7, 4]
initialArray; // => [1, 2, 3, 4]

const outOfOrder = [3, 1, 2];
outOfOrder.toSorted(); // => [1, 2, 3]
outOfOrder; // => [3, 1, 2]

const correctionNeeded = [1, 1, 3];
correctionNeeded.with(1, 2); // => [1, 2, 3]
correctionNeeded; // => [1, 1, 3]
```
