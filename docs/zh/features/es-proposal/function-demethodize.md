---
category: feature
tag:
  - es-proposal
---

# [`Function.prototype.demethodize`](https://github.com/js-choi/proposal-function-demethodize)

## 模块

[`esnext.function.demethodize`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.function.demethodize.js)

## 类型

```ts
interface Function {
  demethodize(): Function;
}
```

## 入口点

```
core-js/proposals/function-demethodize
core-js(-pure)/full/function/demethodize
core-js(-pure)/full/function/virtual/demethodize
```

## 示例

[_示例_](https://tinyurl.com/2ltmohgl):

```js
const slice = Array.prototype.slice.demethodize();

slice([1, 2, 3], 1); // => [2, 3]
```
