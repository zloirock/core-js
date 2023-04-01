---
category: feature
tag:
  - es-proposal
---

# [`compositeKey` 和 `compositeSymbol`](https://github.com/tc39/proposal-richer-keys/tree/master/compositeKey)

## 模块

- [`esnext.composite-key`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.composite-key.js)
- [`esnext.composite-symbol`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.composite-symbol.js)

## 类型

```ts
function compositeKey(...args: Array<any>): object;
function compositeSymbol(...args: Array<any>): symbol;
```

## 入口点

```
core-js/proposals/keys-composition
core-js(-pure)/full/composite-key
core-js(-pure)/full/composite-symbol
```

## 示例

[_示例_](https://goo.gl/2oPAH7):

```js
// 返回 symbol
const symbol = compositeSymbol({});
console.log(typeof symbol); // => 'symbol'

// 效果相同，但是返回一个没有原型的普通冻结对象
const key = compositeKey({});
console.log(typeof key); // => 'object'
console.log({}.toString.call(key)); // => '[object Object]'
console.log(Object.getPrototypeOf(key)); // => null
console.log(Object.isFrozen(key)); // => true

const a = ["a"];
const b = ["b"];
const c = ["c"];

console.log(compositeSymbol(a) === compositeSymbol(a)); // => true
console.log(compositeSymbol(a) !== compositeSymbol(["a"])); // => true
console.log(compositeSymbol(a, 1) === compositeSymbol(a, 1)); // => true
console.log(compositeSymbol(a, b) !== compositeSymbol(b, a)); // => true
console.log(compositeSymbol(a, b, c) === compositeSymbol(a, b, c)); // => true
console.log(compositeSymbol(1, a) === compositeSymbol(1, a)); // => true
console.log(compositeSymbol(1, a, 2, b) === compositeSymbol(1, a, 2, b)); // => true
console.log(compositeSymbol(a, a) === compositeSymbol(a, a)); // => true
```
