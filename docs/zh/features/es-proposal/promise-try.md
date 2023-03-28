---
category: feature
tag:
  - es-proposal
---

# [`Promise.try`](https://github.com/tc39/proposal-promise-try)

::: warning
**该提案已被撤回，并将从下一个主要的 Core-JS 版本中删除。**
:::

## 模块

[`esnext.promise.try`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.promise.try.js)

## 类型

```ts
interface PromiseConstructor {
  try<T>(callbackfn: () => T | Promise<T>): Promise<T>;
}
```

## 入口点

```
core-js/proposals/promise-try
core-js(-pure)/full/promise/try
```

## 示例

[_示例_](https://goo.gl/k5GGRo):

```js
Promise.try(() => 42).then((it) => console.log(`Promise, resolved as ${it}`));

Promise.try(() => {
  throw 42;
}).catch((it) => console.log(`Promise, rejected as ${it}`));
```
