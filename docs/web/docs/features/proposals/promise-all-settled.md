# `Promise.allSettled`
[Specification](https://tc39.es/proposal-promise-allSettled/)\
[Proposal repo](https://github.com/tc39/proposal-promise-allSettled)

## Modules
[`es.promise.all-settled`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.promise.all-settled.js).

## Built-ins signatures
```ts
class Promise {
  static allSettled(iterable: Iterable): Promise;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/promise-all-settled
{ core-js, @core-js/pure }/es|stable|actual|full/promise/all-settled
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/promise-all-settled`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/promise-all-settled.d.ts)

## Examples
```js
Promise.allSettled([
  Promise.resolve(1),
  Promise.reject(2),
  Promise.resolve(3),
]).then(console.log); // -> [{ value: 1, status: 'fulfilled' }, { reason: 2, status: 'rejected' }, { value: 3, status: 'fulfilled' }]
```
