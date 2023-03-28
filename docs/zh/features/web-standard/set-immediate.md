---
category: feature
tag:
  - web-standard
---

# `setImmediate`

## 模块

- [`web.immediate`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.immediate.js)
- [`setImmediate`](https://w3c.github.io/setImmediate/)

## 类型

```ts
function setImmediate<A extends Array<any>>(
  callback: (...args: A) => void,
  ...args: A
): number;
function clearImmediate(id: number): void;
```

## 入口点

```
core-js(-pure)/stable|actual|full/set-immediate
core-js(-pure)/stable|actual|full/clear-immediate
```

## 示例

[_示例_](https://goo.gl/6nXGrx):

```js
setImmediate(
  (arg1, arg2) => {
    console.log(arg1, arg2); // => 消息会被尽快显示
  },
  "Message will be displayed",
  "with minimum delay"
);

clearImmediate(
  setImmediate(() => {
    console.log("Message will not be displayed");
  })
);
```
