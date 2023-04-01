---
category: feature
tag:
  - es-proposal
---

# [`Promise.try`](https://github.com/tc39/proposal-promise-try)

::: warning
**This proposal is dead and will be removed from the next major Core-JS version.**
:::

## Module

[`esnext.promise.try`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.promise.try.js)

## Types

```ts
interface PromiseConstructor {
  try<T>(callbackfn: () => T | Promise<T>): Promise<T>;
}
```

## Entry points

```
core-js/proposals/promise-try
core-js(-pure)/full/promise/try
```

## Example

[_Example_](https://goo.gl/k5GGRo):

```js
Promise.try(() => 42).then((it) => console.log(`Promise, resolved as ${it}`));

Promise.try(() => {
  throw 42;
}).catch((it) => console.log(`Promise, rejected as ${it}`));
```
