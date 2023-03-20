---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`Array.prototype.flat` 和 `Array.prototype.flatMap`](https://github.com/tc39/proposal-flatMap)

## 类型

```ts
class Array {
  flat(depthArg?: number = 1): Array<mixed>;
  flatMap(
    mapFn: (value: any, index: number, target: any) => any,
    thisArg: any
  ): Array<mixed>;
}
```

## 入口点

```
core-js/proposals/array-flat-map
```
