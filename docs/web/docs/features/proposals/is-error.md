# `Error.isError`
[Specification](https://tc39.es/proposal-is-error/)\
[Proposal repo](https://github.com/tc39/proposal-is-error)

## Modules
[`es.error.is-error`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.error.is-error.js).

## Built-ins signatures
```ts
class Error {
  static isError(value: any): boolean;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/is-error
{ core-js, @core-js/pure }/es|stable|actual|full/error/is-error
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/is-error`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/is-error.d.ts)

## Examples
```js
Error.isError(new Error('error')); // => true
Error.isError(new TypeError('error')); // => true
Error.isError(new DOMException('error')); // => true

Error.isError(null); // => false
Error.isError({}); // => false
Error.isError(Object.create(Error.prototype)); // => false
```

> [!WARNING]
> We have no bulletproof way to polyfill this `Error.isError` / check if the object is an error, so it's a rather naive implementation.
