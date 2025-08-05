# Symbol predicates
Specification: [proposal-symbol-predicates](https://github.com/tc39/proposal-symbol-predicates)

## Modules
[`esnext.symbol.is-registered-symbol`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.is-registered-symbol.js), [`esnext.symbol.is-well-known-symbol`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.is-well-known-symbol.js).

```ts
class Symbol {
  static isRegisteredSymbol(value: any): boolean;
  static isWellKnownSymbol(value: any): boolean;
}
```

## [CommonJS entry points]({docs-version}/docs/usage#commonjs-api)
```ts
core-js/proposals/symbol-predicates-v2
core-js(-pure)/full/symbol/is-registered-symbol
core-js(-pure)/full/symbol/is-well-known-symbol
```

## Example
```js
Symbol.isRegisteredSymbol(Symbol.for('key')); // => true
Symbol.isRegisteredSymbol(Symbol('key')); // => false

Symbol.isWellKnownSymbol(Symbol.iterator); // => true
Symbol.isWellKnownSymbol(Symbol('key')); // => false
```
