---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`Object.getOwnPropertyDescriptors`](https://github.com/tc39/proposal-object-getownpropertydescriptors)

## 类型

```ts
class Object {
  static getOwnPropertyDescriptors(object: any): {
    [property: PropertyKey]: PropertyDescriptor;
  };
}
```

## 入口点

```
core-js/proposals/object-getownpropertydescriptors
```
