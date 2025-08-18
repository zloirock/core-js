# `Promise.any`
[Specification](https://tc39.es/proposal-promise-any/)\
[Proposal repo](https://github.com/tc39/proposal-promise-any)

## Signature
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
```ts
core-js/proposals/promise-any
```
