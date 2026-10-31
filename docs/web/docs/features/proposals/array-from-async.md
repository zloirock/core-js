# `Array.fromAsync`
[Specification](https://tc39.es/proposal-array-from-async/)\
[Proposal repo](https://github.com/tc39/proposal-array-from-async)

## Modules
[`es.array.from-async`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.from-async.js).

## Built-ins signatures
```ts
class Array {
  static fromAsync(asyncItems: AsyncIterable | Iterable | ArrayLike, mapFn?: (value: any, index: number) => any, thisArg?: any): Promise<Array<mixed>>;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/array-from-async
{ core-js, @core-js/pure }/es|stable|actual|full/array/from-async
```

## Examples
```js
await Array.fromAsync(
  (async function * () { yield * [1, 2, 3]; })(),
  i => i ** 2
); // => [1, 4, 9]
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/array-from-async`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/array-from-async.d.ts)
