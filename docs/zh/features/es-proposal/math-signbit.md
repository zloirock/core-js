---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`Math.signbit`](https://github.com/tc39/proposal-Math.signbit)

## 模块

[`esnext.math.signbit`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.signbit.js)

## 类型

```ts
interface Math {
  signbit(x: number): boolean;
}
```

## 入口点

```
core-js/proposals/math-signbit
core-js(-pure)/full/math/signbit
```

## 示例

[_示例_](https://goo.gl/rPWbzZ):

```js
Math.signbit(NaN); // => false
Math.signbit(1); // => false
Math.signbit(-1); // => true
Math.signbit(0); // => false
Math.signbit(-0); // => true
```
