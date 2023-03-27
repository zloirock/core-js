---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`Math.signbit`](https://github.com/tc39/proposal-Math.signbit)

## Module

[`esnext.math.signbit`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.signbit.js)

## Types

```ts
interface Math {
  signbit(x: number): boolean;
}
```

## Entry points

```
core-js/proposals/math-signbit
core-js(-pure)/full/math/signbit
```

## Example

[_Examples_](https://goo.gl/rPWbzZ):

```js
Math.signbit(NaN); // => false
Math.signbit(1); // => false
Math.signbit(-1); // => true
Math.signbit(0); // => false
Math.signbit(-0); // => true
```
