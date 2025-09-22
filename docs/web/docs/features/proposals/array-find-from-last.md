# Array find from last
[Specification](https://tc39.es/proposal-array-find-from-last/index.html)\
[Proposal repo](https://github.com/tc39/proposal-array-find-from-last)

## Built-ins signatures
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

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```ts
core-js/proposals/array-find-from-last
```
