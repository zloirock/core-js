# [`Math` extensions](https://github.com/rwaldron/proposal-math-extensions)

Modules [`esnext.math.clamp`](/packages/core-js/modules/esnext.math.clamp.js), [`esnext.math.deg-per-rad`](/packages/core-js/modules/esnext.math.deg-per-rad.js), [`esnext.math.degrees`](/packages/core-js/modules/esnext.math.degrees.js), [`esnext.math.fscale`](/packages/core-js/modules/esnext.math.fscale.js), [`esnext.math.rad-per-deg`](/packages/core-js/modules/esnext.math.rad-per-deg.js), [`esnext.math.radians`](/packages/core-js/modules/esnext.math.radians.js) and [`esnext.math.scale`](/packages/core-js/modules/esnext.math.scale.js)

## Types

```ts
namespace Math {
  DEG_PER_RAD: number;
  RAD_PER_DEG: number;
  clamp(x: number, lower: number, upper: number): number;
  degrees(radians: number): number;
  fscale(x: number, inLow: number, inHigh: number, outLow: number, outHigh: number): number;
  radians(degrees: number): number;
  scale(x: number, inLow: number, inHigh: number, outLow: number, outHigh: number): number;
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