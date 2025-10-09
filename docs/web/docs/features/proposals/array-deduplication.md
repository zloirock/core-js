# Array deduplication
[Proposal repo](https://github.com/tc39/proposal-array-unique)

## Modules
[`esnext.array.unique-by`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/esnext.array.unique-by.js), [`esnext.typed-array.unique-by`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/esnext.typed-array.unique-by.js)

## Built-ins signatures
```ts
class Array {
  uniqueBy(resolver?: (item: any) => any): Array<mixed>;
}

class %TypedArray% {
  uniqueBy(resolver?: (item: any) => any): %TypedArray%;;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/array-unique
core-js(-pure)/full/array(/prototype)/unique-by
core-js/full/typed-array/unique-by
```

## Examples
```js
[1, 2, 3, 2, 1].uniqueBy(); // [1, 2, 3]

[
  { id: 1, uid: 10000 },
  { id: 2, uid: 10000 },
  { id: 3, uid: 10001 },
].uniqueBy(it => it.uid);    // => [{ id: 1, uid: 10000 }, { id: 3, uid: 10001 }]
```
