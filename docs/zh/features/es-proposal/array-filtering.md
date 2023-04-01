---
category: feature
tag:
  - es-proposal
---

# [Array 过滤器](https://github.com/tc39/proposal-array-filtering)

## 模块

- [`esnext.array.filter-reject`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.filter-reject.js)
- [`esnext.typed-array.filter-reject`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.typed-array.filter-reject.js)

## 类型

```ts
interface Array<T> {
  filterReject(callbackfn: (value: t, index: number, target: Array<T>) => boolean, thisArg?: any): Array<T>;
}

interface  {
  filterReject(callbackfn: (value: number, index: number, target: ) => boolean, thisArg?: any): ;
}
```

## 入口点

```
core-js/proposals/array-filtering-stage-1
core-js(-pure)/full/array(/virtual)/filter-reject
core-js/full/typed-array/filter-reject
```

## 示例

[_示例_](https://is.gd/jJcoWw):

```js
[1, 2, 3, 4, 5].filterReject((it) => it % 2); // => [2, 4]
```
