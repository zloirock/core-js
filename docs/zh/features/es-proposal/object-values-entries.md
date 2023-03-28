---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`Object.values` / `Object.entries`](https://github.com/tc39/proposal-object-values-entries)

## 类型

```ts
interface ObjectConstructor {
  entries<T>(object: { [k: string]: string }): Array<[string, T]>;
  values<T>(object: { [k: string]: string }): Array<T>;
}
```

## 入口点

```
core-js/proposals/object-values-entries
```
