# `compositeKey` and `compositeSymbol`
[Proposal repo](https://github.com/tc39/proposal-richer-keys/tree/master/compositeKey)

## Modules
[`esnext.composite-key`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.composite-key.js) and [`esnext.composite-symbol`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.composite-symbol.js).

## Built-ins signatures
```ts
function compositeKey(...args: Array<mixed>): object;
function compositeSymbol(...args: Array<mixed>): symbol;
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/keys-composition
{ core-js, @core-js/pure }/full/composite-key
{ core-js, @core-js/pure }/full/composite-symbol
```

## Examples
```js
// returns a symbol
const symbol = compositeSymbol({});
typeof symbol; // => 'symbol'

// works the same, but returns a plain frozen object without a prototype
const key = compositeKey({});
typeof key; // => 'object'
({}).toString.call(key); // => '[object Object]'
Object.getPrototypeOf(key); // => null
Object.isFrozen(key); // => true

const a = ['a'];
const b = ['b'];
const c = ['c'];

compositeSymbol(a) === compositeSymbol(a); // => true
compositeSymbol(a) !== compositeSymbol(['a']); // => true
compositeSymbol(a, 1) === compositeSymbol(a, 1); // => true
compositeSymbol(a, b) !== compositeSymbol(b, a); // => true
compositeSymbol(a, b, c) === compositeSymbol(a, b, c); // => true
compositeSymbol(1, a) === compositeSymbol(1, a); // => true
compositeSymbol(1, a, 2, b) === compositeSymbol(1, a, 2, b); // => true
compositeSymbol(a, a) === compositeSymbol(a, a); // => true
```
