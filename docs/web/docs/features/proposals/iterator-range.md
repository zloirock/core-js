# `Iterator.range`
[Specification](https://tc39.es/proposal-iterator.range/)\
[Proposal repo](https://github.com/tc39/proposal-iterator.range)

## Modules
[`esnext.iterator.range`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.range.js).

## Built-ins signatures
```ts
class Iterator {
  static range(start: number, end: number, stepOrOptions?: number | null | {
    step?: number | null = end > start ? 1 : -1,
    inclusive?: boolean = false,
  } = end > start ? 1 : -1): NumericRangeIterator;
  static range(start: bigint, end: bigint | Infinity | -Infinity, stepOrOptions?: bigint | null | {
    step?: bigint | null = end > start ? 1n : -1n,
    inclusive?: boolean = false,
  } = end > start ? 1n : -1n): NumericRangeIterator;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/iterator-range
core-js(-pure)/full/iterator/range
```

## Examples
```js
for (const i of Iterator.range(1, 10)) {
  console.log(i); // -> 1, 2, 3, 4, 5, 6, 7, 8, 9
}

for (const i of Iterator.range(1, 10, { step: 3, inclusive: true })) {
  console.log(i); // -> 1, 4, 7, 10
}
```
