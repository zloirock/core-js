# ECMAScript: Symbol
## Modules 
[`es.symbol.constructor`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.symbol.constructor.js), [`es.symbol.for`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.symbol.for.js), [`es.symbol.key-for`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.symbol.key-for.js), [`es.symbol.async-dispose`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.symbol.async-dispose.js), [`es.symbol.async-iterator`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.symbol.async-iterator.js), [`es.symbol.description`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.symbol.description.js), [`es.symbol.dispose`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.symbol.dispose.js), [`es.symbol.has-instance`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.symbol.has-instance.js), [`es.symbol.is-concat-spreadable`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.symbol.is-concat-spreadable.js), [`es.symbol.iterator`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.symbol.iterator.js), [`es.symbol.match`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.symbol.match.js), [`es.symbol.replace`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.symbol.replace.js), [`es.symbol.search`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.symbol.search.js), [`es.symbol.species`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.symbol.species.js), [`es.symbol.split`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.symbol.split.js), [`es.symbol.to-primitive`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.symbol.to-primitive.js), [`es.symbol.to-string-tag`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.symbol.to-string-tag.js), [`es.symbol.unscopables`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.symbol.unscopables.js), [`es.math.to-string-tag`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.math.to-string-tag.js), [`es.object.get-own-property-symbols`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.object.get-own-property-symbols.js).

## Built-ins signatures
```ts
class Symbol {
  constructor(description?): symbol;
  readonly attribute description: string | void;
  static asyncDispose: @@asyncDispose;
  static asyncIterator: @@asyncIterator;
  static dispose: @@dispose;
  static hasInstance: @@hasInstance;
  static isConcatSpreadable: @@isConcatSpreadable;
  static iterator: @@iterator;
  static match: @@match;
  static replace: @@replace;
  static search: @@search;
  static species: @@species;
  static split: @@split;
  static toPrimitive: @@toPrimitive;
  static toStringTag: @@toStringTag;
  static unscopables: @@unscopables;
  static for(key: string): symbol;
  static keyFor(sym: symbol): string;
}

class Object {
  static getOwnPropertySymbols(object: any): Array<symbol>;
}
```
Also wrapped some methods for correct work with `Symbol` polyfill.
```ts
class Object {
  static create(prototype: Object | null, properties?: { [property: PropertyKey]: PropertyDescriptor }): Object;
  static defineProperties(object: Object, properties: { [property: PropertyKey]: PropertyDescriptor })): Object;
  static defineProperty(object: Object, property: PropertyKey, attributes: PropertyDescriptor): Object;
  static getOwnPropertyDescriptor(object: any, property: PropertyKey): PropertyDescriptor | void;
  static getOwnPropertyNames(object: any): Array<string>;
  propertyIsEnumerable(key: PropertyKey): boolean;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```
core-js(-pure)/es|stable|actual|full/symbol
core-js(-pure)/es|stable|actual|full/symbol/async-dispose
core-js(-pure)/es|stable|actual|full/symbol/async-iterator
core-js/es|stable|actual|full/symbol/description
core-js(-pure)/es|stable|actual|full/symbol/dispose
core-js(-pure)/es|stable|actual|full/symbol/has-instance
core-js(-pure)/es|stable|actual|full/symbol/is-concat-spreadable
core-js(-pure)/es|stable|actual|full/symbol/iterator
core-js(-pure)/es|stable|actual|full/symbol/match
core-js(-pure)/es|stable|actual|full/symbol/replace
core-js(-pure)/es|stable|actual|full/symbol/search
core-js(-pure)/es|stable|actual|full/symbol/species
core-js(-pure)/es|stable|actual|full/symbol/split
core-js(-pure)/es|stable|actual|full/symbol/to-primitive
core-js(-pure)/es|stable|actual|full/symbol/to-string-tag
core-js(-pure)/es|stable|actual|full/symbol/unscopables
core-js(-pure)/es|stable|actual|full/symbol/for
core-js(-pure)/es|stable|actual|full/symbol/key-for
core-js(-pure)/es|stable|actual|full/object/get-own-property-symbols
```

## Basic example
```js
let Person = (() => {
  let NAME = Symbol('name');
  return class {
    constructor(name) {
      this[NAME] = name;
    }
    getName() {
      return this[NAME];
    }
  };
})();

let person = new Person('Vasya');
console.log(person.getName());            // => 'Vasya'
console.log(person.name);                 // => undefined
console.log(person[Symbol('name')]);      // => undefined, symbols are uniq
for (let key in person) console.log(key); // => nothing, symbols are not enumerable
```

## `Symbol.for` & `Symbol.keyFor` example
```js
let symbol = Symbol.for('key');
symbol === Symbol.for('key'); // => true
Symbol.keyFor(symbol);        // => 'key'
```

## Example with methods for getting own object keys
```js
let object = { a: 1 };
Object.defineProperty(object, 'b', { value: 2 });
object[Symbol('c')] = 3;
Object.keys(object);                  // => ['a']
Object.getOwnPropertyNames(object);   // => ['a', 'b']
Object.getOwnPropertySymbols(object); // => [Symbol(c)]
Reflect.ownKeys(object);              // => ['a', 'b', Symbol(c)]
```

## Symbol#description getter example
```js
Symbol('foo').description; // => 'foo'
Symbol().description;      // => undefined
```

> [!WARNING]
> - We can't add a new primitive type, `Symbol` returns an object.
> - `Symbol.for` and `Symbol.keyFor` can't be polyfilled cross-realm.
> - `Symbol` polyfill defines setter in `Object.prototype`. For this reason, uncontrolled creation of symbols can cause memory leak and the `in` operator is not working correctly with `Symbol` polyfill: `Symbol() in {} // => true`.
> - `core-js` does not add setters to `Object.prototype` for well-known symbols for correct work something like `Symbol.iterator in foo`. It can cause problems with their enumerability.
> - Some problems are possible with environment exotic objects (for example, IE `localStorage`).
