# `Promise.prototype.finally`
[Specification](https://tc39.es/proposal-promise-finally/index.html)\
[Proposal repo](https://github.com/tc39/proposal-promise-finally)

## Modules
[`es.promise.finally`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.promise.finally.js).

## Built-ins signatures
```ts
class Promise {
  finally(onFinally: Function): Promise;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/promise-finally
{ core-js, @core-js/pure }/es|stable|actual|full/promise/finally
```

## Examples
```js
Promise.resolve(42).finally(() => console.log('You will see it anyway'));

Promise.reject(42).finally(() => console.log('You will see it anyway'));
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/promise-finally`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/promise-finally.d.ts)
