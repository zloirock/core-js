# `Promise.any`
[Specification](https://tc39.es/proposal-promise-any/)\
[Proposal repo](https://github.com/tc39/proposal-promise-any)

## Modules
[`es.aggregate-error`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.aggregate-error.js) and [`es.promise.any`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.promise.any.js).

## Built-ins signatures
```ts
class AggregateError {
  constructor(errors: Iterable, message?: string): AggregateError;
  errors: Array<any>;
  message: string;
}

class Promise {
  static any(promises: Iterable): Promise<any>;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/promise-any
{ core-js, @core-js/pure }/es|stable|actual|full/aggregate-error
{ core-js, @core-js/pure }/es|stable|actual|full/promise/any
```

## Examples
```js
Promise.any([
  Promise.resolve(1),
  Promise.reject(2),
  Promise.resolve(3),
]).then(console.log); // -> 1

Promise.any([
  Promise.reject(1),
  Promise.reject(2),
  Promise.reject(3),
]).catch(({ errors }) => console.log(errors)); // -> [1, 2, 3]
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/promise-any`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/promise-any.d.ts)
