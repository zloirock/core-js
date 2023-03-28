---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`Promise.allSettled`](https://github.com/tc39/proposal-promise-allSettled)

## 类型

```ts
interface PromiseConstructor {
  allSettled<T>(
    iterable: Iterable<Promise<T>>
  ): Promise<PromiseSettledResult<T>>;
}

type PromiseSettledFulfilledResult<T> = {
  status: "fulfilled";
  value: T;
};
type PromiseSettledRejectedResult = {
  status: "rejected";
  reason: any;
};

type PromiseSettledResult<T> =
  | PromiseSettledFulfilledResult<T>
  | PromiseSettledRejectedResult;
```

## 入口点

```
core-js/proposals/promise-all-settled
```
