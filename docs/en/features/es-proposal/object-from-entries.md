---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`Object.fromEntries`](https://github.com/tc39/proposal-object-from-entries)

## Types

```ts
interface ObjectConstructor {
  fromEntries<T = any>(
    iterable: Iterable<[PropertyKey, T]>
  ): { [k: string]: T };
}
```

## Entry points

```
core-js/proposals/object-from-entries
```
