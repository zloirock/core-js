# [Array deduplication](https://github.com/tc39/proposal-array-unique)
Modules [`esnext.array.unique-by`](/packages/core-js/modules/esnext.array.unique-by.js) and [`esnext.typed-array.unique-by`](/packages/core-js/modules/esnext.typed-array.unique-by.js)
```js
class Array {
  uniqueBy(resolver?: (item: any) => any): Array<mixed>;
}

class %TypedArray% {
  uniqueBy(resolver?: (item: any) => any): %TypedArray%;;
}
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
```
core-js/proposals/array-unique
core-js(-pure)/full/array(/virtual)/unique-by
core-js/full/typed-array/unique-by
```
[*Examples*](https://is.gd/lilNPu):
```js
[1, 2, 3, 2, 1].uniqueBy(); // [1, 2, 3]

[
  { id: 1, uid: 10000 },
  { id: 2, uid: 10000 },
  { id: 3, uid: 10001 }
].uniqueBy(it => it.id);    // => [{ id: 1, uid: 10000 }, { id: 3, uid: 10001 }]
```