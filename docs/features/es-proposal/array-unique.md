---
category: feature
tag:
  - es-proposal
---

# [`Array` deduplication](https://github.com/tc39/proposal-array-unique)

## Modules

- [`esnext.array.unique-by`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.unique-by.js)
- [`esnext.typed-array.unique-by`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.typed-array.unique-by.js)

## Types

```ts
interface Array<T> {
  uniqueBy(resolver?: (item: any) => any): Array<T>;
}

interface TypedArray {
  uniqueBy(resolver?: (item: any) => any): TypedArray;;
}
```

## Entry points

```
core-js/proposals/array-unique
core-js(-pure)/full/array(/virtual)/unique-by
core-js/full/typed-array/unique-by
```

## Example

[_Example_](https://is.gd/lilNPu):

```js
[1, 2, 3, 2, 1].uniqueBy(); // [1, 2, 3]

[
  { id: 1, uid: 10000 },
  { id: 2, uid: 10000 },
  { id: 3, uid: 10001 },
].uniqueBy((it) => it.uid); // => [{ id: 1, uid: 10000 }, { id: 3, uid: 10001 }]
```
