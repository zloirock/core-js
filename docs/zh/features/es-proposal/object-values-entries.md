---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`Object.values` / `Object.entries`](https://github.com/tc39/proposal-object-values-entries)

## 类型

```ts
class Object {
  static entries(object: Object): Array<[string, mixed]>;
  static values(object: any): Array<mixed>;
}
```

## 入口点

```
core-js/proposals/object-values-entries
```
