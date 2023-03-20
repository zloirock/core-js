---
category: feature
tag:
  - es-proposal
---

# [`Symbol` 断言](https://github.com/tc39/proposal-symbol-predicates)

## 模块

- [`esnext.symbol.is-registered`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.is-registered.js)
- [`esnext.symbol.is-well-known`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.is-well-known.js)

## 类型

```ts
class Symbol {
  static isRegistered(value: any): boolean;
  static isWellKnown(value: any): boolean;
}
```

## 入口点

```js
core - js / proposals / symbol - predicates;
core - js(-pure) / full / symbol / is - registered;
core - js(-pure) / full / symbol / is - well - known;
```

## 示例

[_示例_](https://tinyurl.com/2cuwpu8d)

```js
Symbol.isRegistered(Symbol.for("key")); // => true
Symbol.isRegistered(Symbol("key")); // => false
Symbol.isWellKnown(Symbol.iterator); // => true
Symbol.isWellKnown(Symbol("key")); // => false
```
