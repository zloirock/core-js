---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [可访问的 `Object.prototype.hasOwnProperty`](https://github.com/tc39/proposal-accessible-object-hasownproperty)

## 类型

```ts
interface ObjectConstructor {
  hasOwn(object: object, key: PropertyKey): boolean;
}
```

## 入口点

```
core-js/proposals/accessible-object-hasownproperty
```
