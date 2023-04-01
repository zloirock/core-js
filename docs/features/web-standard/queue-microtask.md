---
category: feature
tag:
  - web-standard
---

# `queueMicrotask`

[Spec](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-queuemicrotask)

## Module

[`web.queue-microtask`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.queue-microtask.js)

## Types

```ts
function queueMicrotask(fn: Function): void;
```

## Entry points

```
core-js(-pure)/stable|actual|full/queue-microtask
```

## Example

[_Example_](https://goo.gl/nsW8P9):

```js
queueMicrotask(() => console.log("called as microtask"));
```
