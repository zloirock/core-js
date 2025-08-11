# `Array.fromAsync`
[Specification](https://github.com/tc39/proposal-array-from-async)

```ts
class Array {
  static fromAsync(asyncItems: AsyncIterable | Iterable | ArrayLike, mapfn?: (value: any, index: number) => any, thisArg?: any): Array;
}
```

## [CommonJS entry points]({docs-version}/docs/usage#commonjs-api)
```ts
core-js/proposals/array-from-async-stage-2
```
