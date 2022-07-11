# [`Promise.try`](https://github.com/tc39/proposal-promise-try)
**This proposal is dead and will be removed from the next major `core-js` version.**

Module [`esnext.promise.try`](/packages/core-js/modules/esnext.promise.try.js)
```ts
class Promise {
  static try(callbackfn: Function): promise;
}
```
[*CommonJS entry points:*](/docs/usage.md#commonjs-api)
```
core-js/proposals/promise-try
core-js(-pure)/full/promise/try
```
[*Examples*](https://goo.gl/k5GGRo):
```js
Promise.try(() => 42).then(it => console.log(`Promise, resolved as ${it}`));

Promise.try(() => { throw 42; }).catch(it => console.log(`Promise, rejected as ${it}`));
```
