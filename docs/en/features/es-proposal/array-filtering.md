---
category: feature
tag:
  - es-proposal
---

# [Array filtering](https://github.com/tc39/proposal-array-filtering)

## Modules

- [`esnext.array.filter-reject`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.filter-reject.js)
- [`esnext.typed-array.filter-reject`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.typed-array.filter-reject.js)

## Types

```ts
interface Array<T> {
  filterReject(callbackfn: (value: t, index: number, target: Array<T>) => boolean, thisArg?: any): Array<T>;
}

interface  {
  filterReject(callbackfn: (value: number, index: number, target: ) => boolean, thisArg?: any): ;
}
```

## Entry points

```
core-js/proposals/array-filtering-stage-1
core-js(-pure)/full/array(/virtual)/filter-reject
core-js/full/typed-array/filter-reject
```

## Example

[_Example_](https://is.gd/jJcoWw):

```js
[1, 2, 3, 4, 5].filterReject((it) => it % 2); // => [2, 4]
```
