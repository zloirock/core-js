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
  constructor(errors: Iterable<Error>, message?: string, { cause: any }?);
  errors: Array<Error>;
  message: string;
  cause: any;
}

interface PromiseConstructor {
  any<T>(promises: Iterable<Promise<T>>): Promise<T>;
}
```

## Entry points

```
core-js/proposals/promise-any
```
