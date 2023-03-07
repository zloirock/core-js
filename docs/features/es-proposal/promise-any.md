# [`Promise.any`](https://github.com/tc39/proposal-promise-any)

## Types

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

## Entry points

```
core-js/proposals/promise-any
```
