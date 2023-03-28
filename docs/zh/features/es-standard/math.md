---
category: feature
tag:
  - es-standard
  - missing-example
---

# `Math`

## 模块

- [`es.math.acosh`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.acosh.js)
- [`es.math.asinh`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.asinh.js)
- [`es.math.atanh`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.atanh.js)
- [`es.math.cbrt`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.cbrt.js)
- [`es.math.clz32`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.clz32.js)
- [`es.math.cosh`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.cosh.js)
- [`es.math.expm1`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.expm1.js)
- [`es.math.fround`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.fround.js)
- [`es.math.hypot`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.hypot.js)
- [`es.math.imul`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.imul.js)
- [`es.math.log10`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.log10.js)
- [`es.math.log1p`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.log1p.js)
- [`es.math.log2`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.log2.js)
- [`es.math.sign`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.sign.js)
- [`es.math.sinh`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.sinh.js)
- [`es.math.tanh`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.tanh.js)
- [`es.math.trunc`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.trunc.js)

## 类型

```ts
interface Math {
  acosh(number: number): number;
  asinh(number: number): number;
  atanh(number: number): number;
  cbrt(number: number): number;
  clz32(number: number): number;
  cosh(number: number): number;
  expm1(number: number): number;
  fround(number: number): number;
  hypot(...args: Array<number>): number;
  imul(number1: number, number2: number): number;
  log1p(number: number): number;
  log10(number: number): number;
  log2(number: number): number;
  /** @returns 1 | -1 | 0 | -0 | NaN */
  sign(number: number): number;
  sinh(number: number): number;
  tanh(number: number): number;
  trunc(number: number): number;
}
```

## 入口点

```
core-js(-pure)/es|stable|actual|full/math
core-js(-pure)/es|stable|actual|full/math/acosh
core-js(-pure)/es|stable|actual|full/math/asinh
core-js(-pure)/es|stable|actual|full/math/atanh
core-js(-pure)/es|stable|actual|full/math/cbrt
core-js(-pure)/es|stable|actual|full/math/clz32
core-js(-pure)/es|stable|actual|full/math/cosh
core-js(-pure)/es|stable|actual|full/math/expm1
core-js(-pure)/es|stable|actual|full/math/fround
core-js(-pure)/es|stable|actual|full/math/hypot
core-js(-pure)/es|stable|actual|full/math/imul
core-js(-pure)/es|stable|actual|full/math/log1p
core-js(-pure)/es|stable|actual|full/math/log10
core-js(-pure)/es|stable|actual|full/math/log2
core-js(-pure)/es|stable|actual|full/math/sign
core-js(-pure)/es|stable|actual|full/math/sinh
core-js(-pure)/es|stable|actual|full/math/tanh
core-js(-pure)/es|stable|actual|full/math/trunc
```
