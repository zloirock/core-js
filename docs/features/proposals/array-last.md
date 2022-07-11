# [Getting last item from `Array`](https://github.com/keithamus/proposal-array-last)
Modules [`esnext.array.last-item`](/packages/core-js/modules/esnext.array.last-item.js) and [`esnext.array.last-index`](/packages/core-js/modules/esnext.array.last-index.js)
```ts
class Array {
  attribute lastItem: any;
  readonly attribute lastIndex: uint;
}
```
[*CommonJS entry points:*](/docs/usage.md#commonjs-api)
```
core-js/proposals/array-last
core-js/full/array/last-item
core-js/full/array/last-index
```
[*Examples*](https://goo.gl/2TmcMT):
```js
[1, 2, 3].lastItem;  // => 3
[1, 2, 3].lastIndex; // => 2

const array = [1, 2, 3];
array.lastItem = 4;

array; // => [1, 2, 4]
```
