---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [Efficient 64 bit arithmetic](https://gist.github.com/BrendanEich/4294d5c212a6d2254703)

::: warning
**This proposal has been withdrawn and will be removed from the next major Core-JS version.**
:::

## Modules

- [`esnext.math.iaddh`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.iaddh.js)
- [`esnext.math.isubh`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.isubh.js)
- [`esnext.math.imulh`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.imulh.js)
- [`esnext.math.umulh`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.umulh.js)

## Types

```ts
interface Math {
  iaddh(lo0: number, hi0: number, lo1: number, hi1: number): number;
  isubh(lo0: number, hi0: number, lo1: number, hi1: number): number;
  imulh(a: number, b: number): number;
  umulh(a: number, b: number): number;
}
```

## Entry points

```
core-js/proposals/efficient-64-bit-arithmetic
core-js(-pure)/full/math/iaddh
core-js(-pure)/full/math/isubh
core-js(-pure)/full/math/imulh
core-js(-pure)/full/math/umulh
```
