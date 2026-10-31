# Array find from last
[Specification](https://tc39.es/proposal-array-find-from-last/index.html)\
[Proposal repo](https://github.com/tc39/proposal-array-find-from-last)

## Modules
[`es.array.find-last`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.find-last.js), [`es.array.find-last-index`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.find-last-index.js), [`es.typed-array.find-last`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.typed-array.find-last.js) and [`es.typed-array.find-last-index`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.typed-array.find-last-index.js).

## Built-ins signatures
```ts
class Array {
  findLast(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): any;
  findLastIndex(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): number;
}

class %TypedArray% {
  findLast(callbackfn: (value: any, index: number, target: %TypedArray%) => boolean, thisArg?: any): any;
  findLastIndex(callbackfn: (value: any, index: number, target: %TypedArray%) => boolean, thisArg?: any): number;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/array-find-from-last
{ core-js, @core-js/pure }/es|stable|actual|full/array(/virtual)/find-last
{ core-js, @core-js/pure }/es|stable|actual|full/array(/virtual)/find-last-index
core-js/es|stable|actual|full/typed-array/find-last
core-js/es|stable|actual|full/typed-array/find-last-index
```

## Examples
```js
function isOdd(value) {
  return value % 2;
}
[1, 2, 3, 4].findLast(isOdd);      // => 3
[1, 2, 3, 4].findLastIndex(isOdd); // => 2
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/array-find-from-last`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/array-find-from-last.d.ts)
