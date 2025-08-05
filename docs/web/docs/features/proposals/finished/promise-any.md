# [`Promise.any`](https://github.com/tc39/proposal-promise-any)
```ts
class AggregateError {
  constructor(errors: Iterable, message: string): AggregateError;
  errors: Array<any>;
  message: string;
}

class Promise {
  static any(promises: Iterable): Promise<any>;
}
```

## [CommonJS entry points]({docs-version}/docs/usage#commonjs-api)
```
core-js/proposals/promise-any
```
