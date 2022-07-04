# [`Promise.any`](https://github.com/tc39/proposal-promise-any)
```js
class AggregateError {
  constructor(errors: Iterable, message: string): AggregateError;
  errors: Array<any>;
  message: string;
}

class Promise {
  static any(promises: Iterable): Promise<any>;
}
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
```js
core-js/proposals/promise-any
```