---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`Object.getOwnPropertyDescriptors`](https://github.com/tc39/proposal-object-getownpropertydescriptors)

## Types

```ts
interface ObjectConstructor {
  getOwnPropertyDescriptors(object: any): {
    [property: PropertyKey]: PropertyDescriptor;
  };
}
```

## Entry points

```
core-js/proposals/object-getownpropertydescriptors
```
