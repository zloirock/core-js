---
category: feature
tag:
  - es-proposal
  - missing-example
  - untranslated
---

# [`Promise.any`](https://github.com/tc39/proposal-promise-any)

## Types

```ts
class AggregateError extends Error {
  constructor(errors: Iterable, message?: string, { cause: any }?): AggregateError;
  errors: Array<any>;
  message: string;
  cause: any;
}
```

## Entry points

```
core-js/proposals/promise-any
```
