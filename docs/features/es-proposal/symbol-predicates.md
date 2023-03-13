# [`Symbol` predicates](https://github.com/tc39/proposal-symbol-predicates)

## Modules

- [`esnext.symbol.is-registered`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.is-registered.js)
- [`esnext.symbol.is-well-known`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.is-well-known.js)

## Types

```ts
class Symbol {
  static isRegistered(value: any): boolean;
  static isWellKnown(value: any): boolean;
}
```

## Entry points

```js
core - js / proposals / symbol - predicates;
core - js(-pure) / full / symbol / is - registered;
core - js(-pure) / full / symbol / is - well - known;
```

## Example

[_Example_](https://tinyurl.com/2cuwpu8d)

```js
Symbol.isRegistered(Symbol.for("key")); // => true
Symbol.isRegistered(Symbol("key")); // => false
Symbol.isWellKnown(Symbol.iterator); // => true
Symbol.isWellKnown(Symbol("key")); // => false
```
