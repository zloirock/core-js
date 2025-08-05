# [Change `Array` by copy](https://github.com/tc39/proposal-change-array-by-copy)
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

## [CommonJS entry points]({docs-version}/docs/usage#commonjs-api)
```
core-js/proposals/change-array-by-copy-stage-4
core-js(-pure)/es|stable|actual|full/array(/virtual)/to-reversed
core-js(-pure)/es|stable|actual|full/array(/virtual)/to-sorted
core-js(-pure)/es|stable|actual|full/array(/virtual)/to-spliced
core-js(-pure)/es|stable|actual|full/array(/virtual)/with
core-js/es|stable|actual|full/typed-array/to-reversed
core-js/es|stable|actual|full/typed-array/to-sorted
core-js/es|stable|actual|full/typed-array/with
```
