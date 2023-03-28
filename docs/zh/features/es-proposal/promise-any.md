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
  constructor(errors: Iterable<Error>, message?: string, { cause: any }?);
  errors: Array<Error>;
  message: string;
  cause: any;
}

interface PromiseConstructor {
  any<T>(promises: Iterable<Promise<T>>): Promise<T>;
}
```

## 入口点

```
core-js/proposals/promise-any
```
