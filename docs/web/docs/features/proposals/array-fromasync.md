# `Array.fromAsync`
[Specification](https://tc39.es/proposal-array-from-async/)\
[Proposal repo](https://github.com/tc39/proposal-array-from-async)

## Built-ins signatures
```ts
class Array {
  static fromAsync(asyncItems: AsyncIterable | Iterable | ArrayLike, mapfn?: (value: any, index: number) => any, thisArg?: any): Array;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/array-from-async
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/array-from-async`](https://github.com/zloirock/core-js/blob/v4-types/packages/core-js-types/src/base/proposals/array-from-async.d.ts)
