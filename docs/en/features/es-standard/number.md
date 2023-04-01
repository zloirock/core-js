---
category: feature
tag:
  - es-standard
  - missing-example
---

# `Number`

## Modules

- [`es.number.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.number.constructor.js)
  ::: tip
  `Number` constructor support binary and octal literals, [_example_](https://goo.gl/jRd6b3):

  ```js
  Number("0b1010101"); // => 85
  Number("0o7654321"); // => 2054353
  ```

  :::

- [`es.number.epsilon`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.number.epsilon.js)
- [`es.number.is-finite`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.number.is-finite.js)
- [`es.number.is-integer`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.number.is-integer.js)
- [`es.number.is-nan`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.number.is-nan.js)
- [`es.number.is-safe-integer`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.number.is-safe-integer.js)
- [`es.number.max-safe-integer`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.number.max-safe-integer.js)
- [`es.number.min-safe-integer`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.number.min-safe-integer.js)
- [`es.number.parse-float`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.number.parse-float.js)
- [`es.number.parse-int`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.number.parse-int.js)
- [`es.number.to-exponential`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.number.to-exponential.js)
- [`es.number.to-fixed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.number.to-fixed.js)
- [`es.number.to-precision`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.number.to-precision.js)
- [`es.parse-int`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.parse-int.js)
- [`es.parse-float`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.parse-float.js)

## Types

```ts
interface Number {
  toExponential(digits: number): string;
  toFixed(digits: number): string;
  toPrecision(precision: number): string;
  EPSILON: number;
  MAX_SAFE_INTEGER: number;
  MIN_SAFE_INTEGER: number;
}

interface numberConstructor {
  new (value: any): number;
  isFinite(number: any): boolean;
  isNaN(number: any): boolean;
  isInteger(number: any): boolean;
  isSafeInteger(number: any): boolean;
  parseFloat(string: string): number;
  /** @param radix @default 10 */
  parseInt(string: string, radix?: number): number;
}

function parseFloat(string: string): number;
/** @param radix @default 10 */
function parseInt(string: string, radix?: number): number;
```

## Entry points

```
core-js(-pure)/es|stable|actual|full/number
core-js(-pure)/es|stable|actual|full/number/constructor
core-js(-pure)/es|stable|actual|full/number/is-finite
core-js(-pure)/es|stable|actual|full/number/is-nan
core-js(-pure)/es|stable|actual|full/number/is-integer
core-js(-pure)/es|stable|actual|full/number/is-safe-integer
core-js(-pure)/es|stable|actual|full/number/parse-float
core-js(-pure)/es|stable|actual|full/number/parse-int
core-js(-pure)/es|stable|actual|full/number/epsilon
core-js(-pure)/es|stable|actual|full/number/max-safe-integer
core-js(-pure)/es|stable|actual|full/number/min-safe-integer
core-js(-pure)/es|stable|actual|full/number(/virtual)/to-exponential
core-js(-pure)/es|stable|actual|full/number(/virtual)/to-fixed
core-js(-pure)/es|stable|actual|full/number(/virtual)/to-precision
core-js(-pure)/es|stable|actual|full/parse-float
core-js(-pure)/es|stable|actual|full/parse-int
```
