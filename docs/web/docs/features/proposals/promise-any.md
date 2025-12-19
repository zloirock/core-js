# `Promise.any`
[Specification](https://tc39.es/proposal-promise-any/)\
[Proposal repo](https://github.com/tc39/proposal-promise-any)

## Built-ins signatures
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

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/promise-any
```
