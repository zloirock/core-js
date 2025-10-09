# `Array.fromAsync`
[Specification](https://tc39.es/proposal-array-from-async/)\
[Proposal repo](https://github.com/tc39/proposal-array-from-async)

## Built-ins signatures
```ts
class Array {
  static fromAsync(asyncItems: AsyncIterable | Iterable | ArrayLike, mapFn?: (value: any, index: number) => any, thisArg?: any): Promise<Array<mixed>>;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/array-from-async
```
