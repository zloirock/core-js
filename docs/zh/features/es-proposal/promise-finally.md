---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`Promise.prototype.finally`](https://github.com/tc39/proposal-promise-finally)

## 类型

```ts
interface Promise<T> {
  finally(onFinally: () => void): Promise<T>;
}
```

## 入口点

```
core-js/proposals/promise-finally
```
