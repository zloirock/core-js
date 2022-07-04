# [Array filtering](https://github.com/tc39/proposal-array-filtering)
Modules [`esnext.array.filter-reject`](/packages/core-js/modules/esnext.array.filter-reject.js) and [`esnext.typed-array.filter-reject`](/packages/core-js/modules/esnext.typed-array.filter-reject.js).
```js
class Array {
  filterReject(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): Array<mixed>;
}

class %TypedArray% {
  filterReject(callbackfn: (value: number, index: number, target: %TypedArray%) => boolean, thisArg?: any): %TypedArray%;
}
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
```
core-js/proposals/array-filtering-stage-1
core-js(-pure)/full/array(/virtual)/filter-reject
core-js/full/typed-array/filter-reject
```
[*Examples*](https://is.gd/jJcoWw):
```js
[1, 2, 3, 4, 5].filterReject(it => it % 2); // => [2, 4]
```
