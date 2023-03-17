---
category: feature
tag:
  - es-standard
---

# `Object`

## Modules

- [`es.object.assign`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.assign.js)
- [`es.object.create`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.create.js)
- [`es.object.define-getter`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.define-getter.js)
- [`es.object.define-property`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.define-property.js)
- [`es.object.define-properties`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.es.object.define-properties.js)
- [`es.object.define-setter`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.define-setter.js)
- [`es.object.entries`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.entries.js)
- [`es.object.freeze`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.freeze.js)
- [`es.object.from-entries`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.from-entries.js)
- [`es.object.get-own-property-descriptor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.get-own-property-descriptor.js)
- [`es.object.get-own-property-descriptors`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.get-own-property-descriptors.js)
- [`es.object.get-own-property-names`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.get-own-property-names.js)
- [`es.object.get-prototype-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.get-prototype-of.js)
- [`es.object.has-own`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.has-own.js)
- [`es.object.is`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.is.js)
- [`es.object.is-extensible`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.is-extensible.js)
- [`es.object.is-frozen`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.is-frozen.js)
- [`es.object.is-sealed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.is-sealed.js)
- [`es.object.keys`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.keys.js)
- [`es.object.lookup-setter`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.lookup-setter.js)
- [`es.object.lookup-getter`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.lookup-getter.js)
- [`es.object.prevent-extensions`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.prevent-extensions.js)
- [`es.object.proto`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.proto.js)
- [`es.object.to-string`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.to-string.js)
- [`es.object.seal`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.seal.js)
- [`es.object.set-prototype-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.set-prototype-of.js)
- [`es.object.values`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.values.js).

## Types

```ts
interface Object {
  toString(): string; // ES2015+ fix: @@toStringTag support
  __defineGetter__(property: PropertyKey, getter: Function): void;
  __defineSetter__(property: PropertyKey, setter: Function): void;
  __lookupGetter__(property: PropertyKey): Function | void;
  __lookupSetter__(property: PropertyKey): Function | void;
  __proto__: Object | null; // required a way setting of prototype - will not in IE10-, it's for modern engines like Deno
}

interface ObjectConstructor {
  assign(target: Object, ...sources: Array<Object>): Object;
  create(
    prototype: Object | null,
    properties?: { [property: PropertyKey]: PropertyDescriptor }
  ): Object;
  defineProperties(
    object: Object,
    properties: { [property: PropertyKey]: PropertyDescriptor }
  ): Object;
  defineProperty(
    object: Object,
    property: PropertyKey,
    attributes: PropertyDescriptor
  ): Object;
  entries<T>(object: { [key: string]: T }): Array<[string, T]>;
  entries(object: Object): Array<[string, any]>;
  freeze(object: any): any;
  fromEntries<T>(iterable: Iterable<[PropertyKey, T]>): { [k: string]: T };
  getOwnPropertyDescriptor(
    object: any,
    property: PropertyKey
  ): PropertyDescriptor | void;
  getOwnPropertyDescriptors(object: any): {
    [property: PropertyKey]: PropertyDescriptor;
  };
  getOwnPropertyNames(object: any): Array<string>;
  getPrototypeOf(object: any): Object | null;
  hasOwn(object: object, key: PropertyKey): boolean;
  is(value1: any, value2: any): boolean;
  isExtensible(object: any): boolean;
  isFrozen(object: any): boolean;
  isSealed(object: any): boolean;
  keys(object: any): Array<string>;
  preventExtensions(object: any): any;
  seal(object: any): any;
  setPrototypeOf(target: any, prototype: Object | null): any; // required __proto__ - IE11+
  values<T>(object: { [key: string]: T }): Array<T>;
  values(object: any): Array<any>;
}
```

## Entry points

```
core-js(-pure)/es|stable|actual|full/object
core-js(-pure)/es|stable|actual|full/object/assign
core-js(-pure)/es|stable|actual|full/object/is
core-js(-pure)/es|stable|actual|full/object/set-prototype-of
core-js(-pure)/es|stable|actual|full/object/get-prototype-of
core-js(-pure)/es|stable|actual|full/object/create
core-js(-pure)/es|stable|actual|full/object/define-property
core-js(-pure)/es|stable|actual|full/object/define-properties
core-js(-pure)/es|stable|actual|full/object/get-own-property-descriptor
core-js(-pure)/es|stable|actual|full/object/get-own-property-descriptors
core-js(-pure)/es|stable|actual|full/object/has-own
core-js(-pure)/es|stable|actual|full/object/keys
core-js(-pure)/es|stable|actual|full/object/values
core-js(-pure)/es|stable|actual|full/object/entries
core-js(-pure)/es|stable|actual|full/object/get-own-property-names
core-js(-pure)/es|stable|actual|full/object/freeze
core-js(-pure)/es|stable|actual|full/object/from-entries
core-js(-pure)/es|stable|actual|full/object/seal
core-js(-pure)/es|stable|actual|full/object/prevent-extensions
core-js/es|stable|actual|full/object/proto
core-js(-pure)/es|stable|actual|full/object/is-frozen
core-js(-pure)/es|stable|actual|full/object/is-sealed
core-js(-pure)/es|stable|actual|full/object/is-extensible
core-js/es|stable|actual|full/object/to-string
core-js(-pure)/es|stable|actual|full/object/define-getter
core-js(-pure)/es|stable|actual|full/object/define-setter
core-js(-pure)/es|stable|actual|full/object/lookup-getter
core-js(-pure)/es|stable|actual|full/object/lookup-setter
```

## Example

[_Example_](https://is.gd/udzZq0):

```js
let foo = { q: 1, w: 2 };
let bar = { e: 3, r: 4 };
let baz = { t: 5, y: 6 };
Object.assign(foo, bar, baz); // => foo = { q: 1, w: 2, e: 3, r: 4, t: 5, y: 6 }

Object.is(NaN, NaN); // => true
Object.is(0, -0); // => false
Object.is(42, 42); // => true
Object.is(42, "42"); // => false

function Parent() {}
function Child() {}
Object.setPrototypeOf(Child.prototype, Parent.prototype);
new Child() instanceof Child; // => true
new Child() instanceof Parent; // => true

let object = {
  [Symbol.toStringTag]: "Foo",
};

"" + object; // => '[object Foo]'

Object.keys("qwe"); // => ['0', '1', '2']
Object.getPrototypeOf("qwe") === String.prototype; // => true

Object.values({ a: 1, b: 2, c: 3 }); // => [1, 2, 3]
Object.entries({ a: 1, b: 2, c: 3 }); // => [['a', 1], ['b', 2], ['c', 3]]

for (let [key, value] of Object.entries({ a: 1, b: 2, c: 3 })) {
  console.log(key); // => 'a', 'b', 'c'
  console.log(value); // => 1, 2, 3
}

// Shallow object cloning with prototype and descriptors:
let copy = Object.create(
  Object.getPrototypeOf(object),
  Object.getOwnPropertyDescriptors(object)
);
// Mixin:
Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));

const map = new Map([
  ["a", 1],
  ["b", 2],
]);
Object.fromEntries(map); // => { a: 1, b: 2 }

class Unit {
  constructor(id) {
    this.id = id;
  }
  toString() {
    return `unit${this.id}`;
  }
}

const units = new Set([new Unit(101), new Unit(102)]);

Object.fromEntries(units.entries()); // => { unit101: Unit { id: 101 }, unit102: Unit { id: 102 } }

Object.hasOwn({ foo: 42 }, "foo"); // => true
Object.hasOwn({ foo: 42 }, "bar"); // => false
Object.hasOwn({}, "toString"); // => false
```
