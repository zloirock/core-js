# [`Math.signbit`](https://github.com/tc39/proposal-Math.signbit)
Module [`esnext.math.signbit`](/packages/core-js/modules/esnext.math.signbit.js)
```ts
namespace Math {
  signbit(x: number): boolean;
}
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
```
core-js/proposals/math-signbit
core-js(-pure)/full/math/signbit
```
[*Examples*](https://goo.gl/rPWbzZ):
```js
Math.signbit(NaN); // => false
Math.signbit(1);   // => false
Math.signbit(-1);  // => true
Math.signbit(0);   // => false
Math.signbit(-0);  // => true
```
