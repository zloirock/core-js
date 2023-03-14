---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`Promise.any`](https://github.com/tc39/proposal-promise-any)

## Types

```ts
class AggregateError extends Error {
  constructor(
    errors: Iterable,
    message?: string,
    { cause: any }?
  ): AggregateError;
  errors: Array<any>;
  message: string;
  cause: any;
}

class Promise {
  static any(promises: Iterable): Promise<any>;
}
```

## Entry points

```
core-js/proposals/promise-any
```
