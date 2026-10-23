# `Promise.try`
[Specification](https://tc39.es/proposal-promise-try/)\
[Proposal repo](https://github.com/tc39/proposal-promise-try)

## Modules
[`es.promise.try`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.promise.try.js).

## Built-ins signatures
```ts
class Promise {
  static try(callbackfn: Function, ...args: Array<mixed>): Promise;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/promise-try
core-js(-pure)/es|stable|actual|full/promise/try
```

## Examples
```js
Promise.try(() => 42).then(it => console.log(`Promise, resolved as ${ it }`));

Promise.try(() => { throw new Error('42'); }).catch(error => console.log(`Promise, rejected as ${ error }`));

Promise.try(async () => 42).then(it => console.log(`Promise, resolved as ${ it }`));

Promise.try(async () => { throw new Error('42'); }).catch(error => console.log(`Promise, rejected as ${ error }`));

Promise.try(it => it, 42).then(it => console.log(`Promise, resolved as ${ it }`));
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/promise-try`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/promise-try.d.ts)
