---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [ES 相关的索引方法](https://github.com/tc39/proposal-relative-indexing-method)

## 类型

```ts
interface Array<T> {
  at(index: number): T | undefined;
}

interface String {
  at(index: number): string | undefined;
}

interface TypedArray {
  at(index: number): number | undefined;
}
```

## 入口点

```
core-js/proposals/relative-indexing-method
```
