---
category: feature
tag:
  - es-proposal
---

# [`Symbol` 断言](https://github.com/tc39/proposal-symbol-predicates)

## 模块

- [`esnext.symbol.is-registered-symbol`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.is-registered-symbol.js)
- [`esnext.symbol.is-well-known-symbol`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.is-well-known-symbol.js)

## 类型

```ts
interface SymbolConstructor {
  isRegisteredSymbol(value: symbol): boolean;
  isWellKnownSymbol(value: symbol): boolean;
}
```

## 入口点

```
core-js/proposals/symbol-predicates-v2
core-js(-pure)/full/symbol/is-registered-symbol
core-js(-pure)/full/symbol/is-well-known-symbol
```

## 示例

[_示例_](https://tinyurl.com/2oqoaq7t)

```js
Symbol.isRegisteredSymbol(Symbol.for("key")); // => true
Symbol.isRegisteredSymbol(Symbol("key")); // => false
Symbol.isWellKnownSymbol(Symbol.iterator); // => true
Symbol.isWellKnownSymbol(Symbol("key")); // => false
```
