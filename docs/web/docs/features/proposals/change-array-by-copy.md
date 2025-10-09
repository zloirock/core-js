# Change `Array` by copy
[Specification](https://tc39.es/proposal-change-array-by-copy/)\
[Proposal repo](https://github.com/tc39/proposal-change-array-by-copy)

## Built-ins signatures
```ts
class Array {
  toReversed(): Array<mixed>;
  toSpliced(start?: number, deleteCount?: number, ...items: Array<mixed>): Array<mixed>;
  toSorted(comparefn?: (a: any, b: any) => number): Array<mixed>;
  with(index: includes, value: any): Array<mixed>;
}

class %TypedArray% {
  toReversed(): %TypedArray%;
  toSorted(comparefn?: (a: any, b: any) => number): %TypedArray%;
  with(index: includes, value: any): %TypedArray%;
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
