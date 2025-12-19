# Symbol predicates
[Specification](https://tc39.es/proposal-symbol-predicates/)\
[Proposal repo](https://github.com/tc39/proposal-symbol-predicates)

## Modules
[`esnext.symbol.is-registered-symbol`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.is-registered-symbol.js), [`esnext.symbol.is-well-known-symbol`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.is-well-known-symbol.js).

## Built-ins signatures
```ts
class Symbol {
  static isRegisteredSymbol(value: any): boolean;
  static isWellKnownSymbol(value: any): boolean;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
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
