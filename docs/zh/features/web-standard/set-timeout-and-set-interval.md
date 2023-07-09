---
category: feature
tag:
  - web-standard
  - missing-example
---

# `setTimeout` 和 `setInterval`

为修复 IE9- 的额外参数：

```js
// 以前：
setTimeout(log.bind(null, 42), 1000);
// 现在：
setTimeout(log, 1000, 42);
```

## 模块

- [`web.timers`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.timers.js).

## 类型

```ts
function setTimeout<A extends Array<any>>(
  callback: (...args: A) => void,
  time: number,
  ...args: A
): number;
function setInterval<A extends Array<any>>(
  callback: (...args: A) => void,
  time: number,
  ...args: A
): number;
```

## 入口点

```
core-js(-pure)/stable|actual|full/set-timeout
core-js(-pure)/stable|actual|full/set-interval
```
