---
category: feature
tag:
  - web-standard
---

# `setImmediate`

## Modules

- [`web.immediate`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.immediate.js)
- [`setImmediate`](https://w3c.github.io/setImmediate/)

## Types

```ts
function setImmediate<A extends Array<any>>(
  callback: (...args: A) => void,
  ...args: A
): number;
function clearImmediate(id: number): void;
```

## Entry points

```
core-js(-pure)/stable|actual|full/set-immediate
core-js(-pure)/stable|actual|full/clear-immediate
```

## Example

[_Example_](https://goo.gl/6nXGrx):

```js
setImmediate(
  (arg1, arg2) => {
    console.log(arg1, arg2); // => Message will be displayed with minimum delay
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
