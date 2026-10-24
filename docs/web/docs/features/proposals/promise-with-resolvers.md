# `Promise.withResolvers`
[Specification](https://tc39.es/proposal-promise-with-resolvers/)\
[Proposal repo](https://github.com/tc39/proposal-promise-with-resolvers)

## Modules
[`es.promise.with-resolvers`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.promise.with-resolvers.js).

## Built-ins signatures
```ts
class Promise {
  static withResolvers(): { promise: Promise, resolve: Function, reject: Function };
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/promise-with-resolvers
{ core-js, @core-js/pure }/es|stable|actual|full/promise/with-resolvers
```

## Examples
```js
const d = Promise.withResolvers();
d.resolve(42);
d.promise.then(console.log); // -> 42
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/promise-with-resolvers`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/promise-with-resolvers.d.ts)
