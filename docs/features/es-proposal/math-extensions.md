---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`Math` extensions](https://github.com/rwaldron/proposal-math-extensions)

## Modules

- [`esnext.math.clamp`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.clamp.js)
- [`esnext.math.deg-per-rad`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.deg-per-rad.js)
- [`esnext.math.degrees`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.degrees.js)
- [`esnext.math.fscale`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.fscale.js)
- [`esnext.math.rad-per-deg`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.rad-per-deg.js)
- [`esnext.math.radians`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.radians.js)
- [`esnext.math.scale`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.scale.js)

## Types

```ts
interface Math {
  DEG_PER_RAD: number;
  RAD_PER_DEG: number;
  clamp(x: number, lower: number, upper: number): number;
  degrees(radians: number): number;
  fscale(
    x: number,
    inLow: number,
    inHigh: number,
    outLow: number,
    outHigh: number
  ): number;
  radians(degrees: number): number;
  scale(
    x: number,
    inLow: number,
    inHigh: number,
    outLow: number,
    outHigh: number
  ): number;
}
```

## Entry points

```
core-js/proposals/math-extensions
core-js(-pure)/full/math/clamp
core-js(-pure)/full/math/deg-per-rad
core-js(-pure)/full/math/degrees
core-js(-pure)/full/math/fscale
core-js(-pure)/full/math/rad-per-deg
core-js(-pure)/full/math/radians
core-js(-pure)/full/math/scale
```
