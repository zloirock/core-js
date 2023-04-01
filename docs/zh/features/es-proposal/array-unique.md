---
category: feature
tag:
  - es-proposal
---

# [`Array` 去重](https://github.com/tc39/proposal-array-unique)

## 模块

- [`esnext.array.unique-by`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.unique-by.js)
- [`esnext.typed-array.unique-by`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.typed-array.unique-by.js)

## 类型

```ts
interface Array<T> {
  uniqueBy(resolver?: (item: any) => any): Array<T>;
}

interface TypedArray {
  uniqueBy(resolver?: (item: any) => any): TypedArray;;
}
```

## 入口点

```
core-js/proposals/array-unique
core-js(-pure)/full/array(/virtual)/unique-by
core-js/full/typed-array/unique-by
```

## 示例

[_示例_](https://is.gd/lilNPu):

```js
[1, 2, 3, 2, 1].uniqueBy(); // [1, 2, 3]

[
  { id: 1, uid: 10000 },
  { id: 2, uid: 10000 },
  { id: 3, uid: 10001 },
].uniqueBy((it) => it.uid); // => [{ id: 1, uid: 10000 }, { id: 3, uid: 10001 }]
```
