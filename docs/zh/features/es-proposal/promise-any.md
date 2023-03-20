---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`Promise.any`](https://github.com/tc39/proposal-promise-any)

## 类型

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
```

## 入口点

```
core-js/proposals/promise-any
```
