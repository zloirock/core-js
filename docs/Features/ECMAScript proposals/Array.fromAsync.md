# [`Array.fromAsync`](https://github.com/tc39/proposal-array-from-async)
Modules [`esnext.array.from-async`](/packages/core-js/modules/esnext.array.from-async.js).
```js
class Array {
  static fromAsync(asyncItems: AsyncIterable | Iterable | ArrayLike, mapfn?: (value: any, index: number) => any, thisArg?: any): Array;
}
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
```js
core-js/proposals/array-from-async-stage-2
core-js(-pure)/full/array/from-async
```
[*Example*](https://goo.gl/Jt7SsD):
```js
await Array.fromAsync((async function * (){ yield * [1, 2, 3] })(), i => i * i); // => [1, 4, 9]
```
