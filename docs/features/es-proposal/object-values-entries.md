---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`Object.values` / `Object.entries`](https://github.com/tc39/proposal-object-values-entries)

## Types

```ts
interface ObjectConstructor {
  entries<T>(object: { [k: string]: string }): Array<[string, T]>;
  values<T>(object: { [k: string]: string }): Array<T>;
}
```

## Entry points

```
core-js/proposals/object-values-entries
```
