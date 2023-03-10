---
category: feature
tag:
  - es-proposal
  - missing-example
  - untranslated
---

# [`Object.getOwnPropertyDescriptors`](https://github.com/tc39/proposal-object-getownpropertydescriptors)

## Types

```ts
class Object {
  static getOwnPropertyDescriptors(object: any): {
    [property: PropertyKey]: PropertyDescriptor;
  };
}
```

## Entry points

```
core-js/proposals/object-getownpropertydescriptors
```
