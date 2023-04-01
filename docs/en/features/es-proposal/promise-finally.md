---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`Promise.prototype.finally`](https://github.com/tc39/proposal-promise-finally)

## Types

```ts
interface Promise<T> {
  finally(onFinally: () => void): Promise<T>;
}
```

## Entry points

```
core-js/proposals/promise-finally
```
