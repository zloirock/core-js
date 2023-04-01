---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [从最后开始查找 Array](https://github.com/tc39/proposal-array-find-from-last)

## 类型

```ts
interface Array<T> {
  findLast(callbackfn: (value: T, index: number, target: Array<T>) => boolean, thisArg?: any): T;
  findLastIndex(callbackfn: (value: T, index: number, target: Array<T>) => boolean, thisArg?: any): number;
}

interface TypedArray {
  findLast(callbackfn: (value: any, index: number, target: ) => boolean, thisArg?: any): any;
  findLastIndex(callbackfn: (value: any, index: number, target: ) => boolean, thisArg?: any): number;
}
```

## 入口点

```
core-js/proposals/array-find-from-last
```
