# [`Number.range`](https://github.com/tc39/proposal-Number.range)
Module [`esnext.number.range`](/packages/core-js/modules/esnext.number.range.js) and [`esnext.bigint.range`](/packages/core-js/modules/esnext.bigint.range.js)
```js
class Number {
  range(start: number, end: number, options: { step: number = 1, inclusive: boolean = false } | step: number = 1): RangeIterator;
}

class BigInt {
  range(start: bigint, end: bigint | Infinity | -Infinity, options: { step: bigint = 1n, inclusive: boolean = false } | step: bigint = 1n): RangeIterator;
}
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
```js
core-js/proposals/number-range
core-js(-pure)/full/bigint/range
core-js(-pure)/full/number/range
```
[*Example*](https://is.gd/caCKSb):
```js
for (const i of Number.range(1, 10)) {
  console.log(i); // => 1, 2, 3, 4, 5, 6, 7, 8, 9
}

for (const i of Number.range(1, 10, { step: 3, inclusive: true })) {
  console.log(i); // => 1, 4, 7, 10
}
```