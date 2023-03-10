---
category: feature
tag:
  - es-proposal
  - missing-example
  - untranslated
---

# [`Object.values` / `Object.entries`](https://github.com/tc39/proposal-object-values-entries)

## Types

```ts
class Object {
  static entries(object: Object): Array<[string, mixed]>;
  static values(object: any): Array<mixed>;
}
```

## Entry points

```
core-js/proposals/object-values-entries
```
