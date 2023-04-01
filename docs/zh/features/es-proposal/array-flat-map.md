---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`Array.prototype.flat` 和 `Array.prototype.flatMap`](https://github.com/tc39/proposal-flatMap)

## 类型

```ts
interface Array<T> {
  flat(depthArg: number): Array<T>;
  flatMap<U>(
    mapFn: (value: T, index: number, target: Array<T>) => U | Array<U>,
    thisArg: any
  ): Array<U>;
}
```

## 入口点

```
core-js/proposals/array-flat-map
```
