# `Number`
Module [`es.number.constructor`](/packages/core-js/modules/es.number.constructor.js). `Number` constructor support binary and octal literals, [*example*](https://goo.gl/jRd6b3):
```js
Number('0b1010101'); // => 85
Number('0o7654321'); // => 2054353
```
Modules [`es.number.epsilon`](/packages/core-js/modules/es.number.epsilon.js), [`es.number.is-finite`](/packages/core-js/modules/es.number.is-finite.js), [`es.number.is-integer`](/packages/core-js/modules/es.number.is-integer.js), [`es.number.is-nan`](/packages/core-js/modules/es.number.is-nan.js), [`es.number.is-safe-integer`](/packages/core-js/modules/es.number.is-safe-integer.js), [`es.number.max-safe-integer`](/packages/core-js/modules/es.number.max-safe-integer.js), [`es.number.min-safe-integer`](/packages/core-js/modules/es.number.min-safe-integer.js), [`es.number.parse-float`](/packages/core-js/modules/es.number.parse-float.js), [`es.number.parse-int`](/packages/core-js/modules/es.number.parse-int.js), [`es.number.to-exponential`](/packages/core-js/modules/es.number.to-exponential.js), [`es.number.to-fixed`](/packages/core-js/modules/es.number.to-fixed.js), [`es.number.to-precision`](/packages/core-js/modules/es.number.to-precision.js), [`es.parse-int`](/packages/core-js/modules/es.parse-int.js), [`es.parse-float`](/packages/core-js/modules/es.parse-float.js).
```ts
class Number {
  constructor(value: any): number;
  toExponential(digits: number): string;
  toFixed(digits: number): string;
  toPrecision(precision: number): string;
  static isFinite(number: any): boolean;
  static isNaN(number: any): boolean;
  static isInteger(number: any): boolean;
  static isSafeInteger(number: any): boolean;
  static parseFloat(string: string): number;
  static parseInt(string: string, radix?: number = 10): number;
  static EPSILON: number;
  static MAX_SAFE_INTEGER: number;
  static MIN_SAFE_INTEGER: number;
}

function parseFloat(string: string): number;
function parseInt(string: string, radix?: number = 10): number;
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/number
core-js/es|stable|actual|full/number/constructor
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
