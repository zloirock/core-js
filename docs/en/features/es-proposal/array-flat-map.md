---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`Array.prototype.flat` & `Array.prototype.flatMap`](https://github.com/tc39/proposal-flatMap)

## Types

```ts
interface Array<T> {
  flat(depthArg: number): Array<T>;
  flatMap<U>(
    mapFn: (value: T, index: number, target: Array<T>) => U | Array<U>,
    thisArg: any
  ): Array<U>;
}
```

## Entry points

```
core-js/proposals/array-flat-map
```
