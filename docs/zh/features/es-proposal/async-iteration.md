---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [用于异步迭代的 `Symbol.asyncIterator`](https://github.com/tc39/proposal-async-iteration)

## 类型

```ts
interface Object {
  iterateKeys(object: { [k: PropertyKey]: any }): Iterator<string>;
  iterateValues<T>(object: { [k: PropertyKey]: T }): Iterator<T>;
  iterateEntries<T>(object: { [k: PropertyKey]: T }): Iterator<[string, T]>;
}
```

## 入口点

```
core-js/proposals/async-iteration
```
