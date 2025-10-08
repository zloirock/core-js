# ECMAScript: Error
## Modules 
[`es.aggregate-error`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.aggregate-error.js), [`es.aggregate-error.cause`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.aggregate-error.cause.js), [`es.error.cause`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.error.cause.js), [`es.error.is-error`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.error.is-error.js), [`es.suppressed-error.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.suppressed-error.constructor.js), [`es.error.to-string`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.error.to-string.js).

## Built-ins signatures
```ts
class Error {
  static isError(value: any): boolean;
  constructor(message: string, { cause: any }): %Error%;
  toString(): string; // different fixes
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
  constructor(message: string, { cause: any }): %Error%;
}

class AggregateError extends Error {
  constructor(errors: Iterable, message?: string, { cause: any }?): AggregateError;
  errors: Array<any>;
  message: string;
  cause: any;
}

class SuppressedError extends Error {
  constructor(error: any, suppressed: any, message?: string): SuppressedError;
  error: any;
  suppressed: any;
  message: string;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```
core-js/es|stable|actual|full/error
core-js/es|stable|actual|full/error/constructor
core-js(-pure)/es|stable|actual|full/error/is-error
core-js/es|stable|actual|full/error/to-string
core-js(-pure)/es|stable|actual|full/aggregate-error
core-js(-pure)/es|stable|actual|full/suppressed-error
```

## Examples
```js
const error1 = new TypeError('Error 1');
const error2 = new TypeError('Error 2');
const aggregate = new AggregateError([error1, error2], 'Collected errors');
aggregate.errors[0] === error1; // => true
aggregate.errors[1] === error2; // => true

const cause = new TypeError('Something wrong');
const error = new TypeError('Here explained what`s wrong', { cause });
error.cause === cause; // => true

Error.prototype.toString.call({ message: 1, name: 2 }) === '2: 1'; // => true
```

## `Error.isError` examples
```js
Error.isError(new Error('error')); // => true
Error.isError(new TypeError('error')); // => true
Error.isError(new DOMException('error')); // => true

Error.isError(null); // => false
Error.isError({}); // => false
Error.isError(Object.create(Error.prototype)); // => false
```

> [!WARNING]
> We have no bulletproof way to polyfill this `Error.isError` / check if the object is an error, so it's an enough naive implementation.
