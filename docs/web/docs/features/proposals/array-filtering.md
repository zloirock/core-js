# Array filtering
[Specification](https://tc39.es/proposal-array-filtering/)\
[Proposal repo](https://github.com/tc39/proposal-array-filtering)

## Modules
[`esnext.array.filter-reject`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/esnext.array.filter-reject.js), [`esnext.typed-array.filter-reject`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/esnext.typed-array.filter-reject.js).

## Built-ins signatures
```ts
class Array {
  filterReject(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): Array<mixed>;
}

class %TypedArray% {
  filterReject(callbackfn: (value: number, index: number, target: %TypedArray%) => boolean, thisArg?: any): %TypedArray%;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/array-filtering
core-js(-pure)/full/array(/prototype)/filter-reject
core-js/full/typed-array/filter-reject
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/array-filtering`](https://github.com/zloirock/core-js/blob/v4-types/packages/core-js-types/src/base/proposals/array-filtering.d.ts)

## Examples
```js
[1, 2, 3, 4, 5].filterReject(it => it % 2); // => [2, 4]
```
