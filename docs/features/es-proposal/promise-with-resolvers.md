---
category: feature
tag:
  - es-proposal
---

# [`Promise.withResolvers`](https://github.com/tc39/proposal-promise-with-resolvers)

## Module

[`esnext.promise.with-resolvers`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.promise.with-resolvers.js)

## Types

```ts
interface PromiseConstructor {
  withResolvers<T>(): {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
  };
}
```

## Entry points

```
core-js/proposals/promise-with-resolvers
core-js(-pure)/full/promise/with-resolvers
```

## Example

[_Example_](https://tinyurl.com/2gx4t3xu):

```js
const d = Promise.withResolvers();
d.resolve(42);
d.promise.then(console.log); // => 42
```
