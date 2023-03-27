---
category: feature
tag:
  - es-proposal
---

# [`compositeKey` and `compositeSymbol`](https://github.com/tc39/proposal-richer-keys/tree/master/compositeKey)

## Modules

- [`esnext.composite-key`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.composite-key.js)
- [`esnext.composite-symbol`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.composite-symbol.js)

## Types

```ts
function compositeKey(...args: Array<any>): object;
function compositeSymbol(...args: Array<any>): symbol;
```

## Entry points

```
core-js/proposals/keys-composition
core-js(-pure)/full/composite-key
core-js(-pure)/full/composite-symbol
```

## Example

[_Example_](https://goo.gl/2oPAH7):

```js
// returns a symbol
const symbol = compositeSymbol({});
console.log(typeof symbol); // => 'symbol'

// works the same, but returns a plain frozen object without a prototype
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
