---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [从最后开始查找 Array](https://github.com/tc39/proposal-array-find-from-last)

## 类型

```ts
class Array {
  findLast(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): any;
  findLastIndex(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): uint;
}

class %TypedArray% {
  findLast(callbackfn: (value: any, index: number, target: %TypedArray%) => boolean, thisArg?: any): any;
  findLastIndex(callbackfn: (value: any, index: number, target: %TypedArray%) => boolean, thisArg?: any): uint;
}
```

## 入口点

```
core-js/proposals/array-find-from-last
```
