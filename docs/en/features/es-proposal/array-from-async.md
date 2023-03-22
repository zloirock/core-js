---
category: feature
tag:
  - es-proposal
---

# [`Array.fromAsync`](https://github.com/tc39/proposal-array-from-async)

## Module

[`esnext.array.from-async`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.from-async.js)

## Types

```ts
interface ArrayConstructor {
  fromAsync<T, U>(
    asyncItems: AsyncIterable<T> | Iterable<T> | ArrayLike<T>,
    mapfn?: (value: T, index: number) => U,
    thisArg?: any
  ): Array<T>;
}
```

## Entry points

```
core-js/proposals/array-from-async-stage-2
core-js(-pure)/full/array/from-async
```

## Example

[_Example_](https://goo.gl/Jt7SsD):

```js
await Array.fromAsync(
  (async function* () {
    yield* [1, 2, 3];
  })(),
  (i) => i * i
); // => [1, 4, 9]
```
