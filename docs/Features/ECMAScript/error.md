# ES Error
Modules [`es.aggregate-error`](/packages/core-js/modules/es.aggregate-error.js), [`es.aggregate-error.cause`](/packages/core-js/modules/es.aggregate-error.cause.js), [`es.error.cause`](/packages/core-js/modules/es.error.cause.js).
```js
class [
  Error,
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError,
  WebAssembly.CompileError,
  WebAssembly.LinkError,
  WebAssembly.RuntimeError,
] {
  constructor(message: string, { cause: any }): %Error%;
}

class AggregateError {
  constructor(errors: Iterable, message: string, { cause: any }): AggregateError;
  errors: Array<any>;
  message: string;
}

class Error {
  toString(): string; // different fixes
}
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/aggregate-error
core-js/es|stable|actual|full/error
core-js/es|stable|actual|full/error/constructor
core-js/es|stable|actual|full/error/to-string
```
[*Example*](https://is.gd/1SufcH):
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
