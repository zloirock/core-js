# `Error` cause
[Specification](https://tc39.es/proposal-error-cause/)\
[Proposal repo](https://github.com/tc39/proposal-error-cause)

## Modules
[`es.aggregate-error.cause`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.aggregate-error.cause.js) and [`es.error.cause`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.error.cause.js).

## Built-ins signatures
```ts
class Error {
  constructor(message?: string, { cause: any }?): %Error%;
}

class [
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError,
  WebAssembly.CompileError,
  WebAssembly.LinkError,
  WebAssembly.RuntimeError,
] extends Error {
  constructor(message?: string, { cause: any }?): %Error%;
}

class AggregateError extends Error {
  constructor(errors: Iterable, message?: string, { cause: any }?): AggregateError;
  cause: any;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/error-cause
core-js/es|stable|actual|full/error
core-js/es|stable|actual|full/error/constructor
{ core-js, @core-js/pure }/es|stable|actual|full/aggregate-error
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/error-cause`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/error-cause.d.ts)

## Examples
```js
const cause = new TypeError('Something wrong');
const error = new TypeError('Here is what went wrong', { cause });
error.cause === cause; // => true
```
