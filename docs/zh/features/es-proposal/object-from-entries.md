---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`Object.fromEntries`](https://github.com/tc39/proposal-object-from-entries)

## 类型

```ts
interface ObjectConstructor {
  fromEntries<T = any>(
    iterable: Iterable<[PropertyKey, T]>
  ): { [k: string]: T };
}
```

## 入口点

```
core-js/proposals/object-from-entries
```
