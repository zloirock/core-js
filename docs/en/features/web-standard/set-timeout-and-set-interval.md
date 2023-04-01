---
category: feature
tag:
  - web-standard
  - missing-example
---

# `setTimeout` and `setInterval`

Additional arguments fix for IE9-:

```js
// Before:
setTimeout(log.bind(null, 42), 1000);
// After:
setTimeout(log, 1000, 42);
```

## Module

- [`web.timers`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.timers.js).

## Types

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

## Entry points

```
core-js(-pure)/stable|actual|full/set-timeout
core-js(-pure)/stable|actual|full/set-interval
```
