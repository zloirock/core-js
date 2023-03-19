---
category: feature
tag:
  - web-standard
---

# `queueMicrotask`

[规范](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-queuemicrotask)

## 模块

[`web.queue-microtask`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.queue-microtask.js)

## 类型

```ts
function queueMicrotask(fn: Function): void;
```

## 入口点

```
core-js(-pure)/stable|actual|full/queue-microtask
```

## 示例

[_示例_](https://goo.gl/nsW8P9):

```js
queueMicrotask(() => console.log("called as microtask"));
```
