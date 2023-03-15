---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [Accessible `Object.prototype.hasOwnProperty`](https://github.com/tc39/proposal-accessible-object-hasownproperty)

## Types

```ts
interface ObjectConstructor {
  hasOwn(object: object, key: PropertyKey): boolean;
}
```

## Entry points

```
core-js/proposals/accessible-object-hasownproperty
```
