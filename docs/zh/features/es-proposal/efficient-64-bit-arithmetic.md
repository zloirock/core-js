---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [高效的 64 bit 算法](https://gist.github.com/BrendanEich/4294d5c212a6d2254703)

::: warning
**该提案已被撤回，将从下一个主要的 Core-JS 版本中删除。**
:::

## 模块

- [`esnext.math.iaddh`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.iaddh.js)
- [`esnext.math.isubh`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.isubh.js)
- [`esnext.math.imulh`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.imulh.js)
- [`esnext.math.umulh`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.umulh.js)

## 类型

```ts
interface Math {
  iaddh(lo0: number, hi0: number, lo1: number, hi1: number): number;
  isubh(lo0: number, hi0: number, lo1: number, hi1: number): number;
  imulh(a: number, b: number): number;
  umulh(a: number, b: number): number;
}
```

## 入口点

```
core-js/proposals/efficient-64-bit-arithmetic
core-js(-pure)/full/math/iaddh
core-js(-pure)/full/math/isubh
core-js(-pure)/full/math/imulh
core-js(-pure)/full/math/umulh
```
