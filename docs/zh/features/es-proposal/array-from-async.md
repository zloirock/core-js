---
category: feature
tag:
  - es-proposal
---

# [`Array.fromAsync`](https://github.com/tc39/proposal-array-from-async)

## 模块

[`esnext.array.from-async`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.from-async.js)

## 类型

```ts
class Array {
  static fromAsync(
    asyncItems: AsyncIterable | Iterable | ArrayLike,
    mapfn?: (value: any, index: number) => any,
    thisArg?: any
  ): Array;
}
```

## 入口点

```
core-js/proposals/array-from-async-stage-2
core-js(-pure)/full/array/from-async
```

## 示例

[_示例_](https://goo.gl/Jt7SsD):

```js
await Array.fromAsync(
  (async function* () {
    yield* [1, 2, 3];
  })(),
  (i) => i * i
); // => [1, 4, 9]
```
