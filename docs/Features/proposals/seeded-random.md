# [Seeded pseudo-random numbers](https://github.com/tc39/proposal-seeded-random)
**API of this proposal has been changed. This proposal will be removed from the next major `core-js` version and will be added back after adding and stabilization of the spec text.**

Module [`esnext.math.seeded-prng`](/packages/core-js/modules/esnext.math.seeded-prng.js)
```ts
class Math {
  seededPRNG({ seed: number }): Iterator<number>;
}
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
```
core-js/proposals/seeded-random
core-js(-pure)/full/math/seeded-prng
```
[*Example*](https://goo.gl/oj3WgQ):
```js
for (let x of Math.seededPRNG({ seed: 42 })) {
  console.log(x); // => 0.16461519912315087, 0.2203933906000046, 0.8249682894209105
  if (x > .8) break;
}
```
