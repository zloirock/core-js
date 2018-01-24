# core-js

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/zloirock/core-js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![version](https://img.shields.io/npm/v/core-js.svg)](https://www.npmjs.com/package/core-js) [![npm downloads](https://img.shields.io/npm/dm/core-js.svg)](http://npm-stat.com/charts.html?package=core-js&author=&from=2014-11-18) [![Build Status](https://travis-ci.org/zloirock/core-js.svg)](https://travis-ci.org/zloirock/core-js) [![devDependency status](https://david-dm.org/zloirock/core-js/dev-status.svg)](https://david-dm.org/zloirock/core-js?type=dev)
#### As advertising: the author is looking for a good job :)

Modular standard library for JavaScript. Includes polyfills for [ECMAScript 5, 2015, 2016, 2017](#ecmascript): [promises](#ecmascript-promise), [symbols](#ecmascript-symbol), [collections](#ecmascript-collections), iterators, [typed arrays](#ecmascript-typed-arrays), many other features, [ECMAScript proposals](#ecmascript-proposals), [some cross-platform WHATWG / W3C ECMAScript-related features and proposals](#web-standards) like [setImmediate](#setimmediate). You can load only required features or use it without global namespace pollution.

[*Example*](http://goo.gl/a2xexl):
```js
import 'core-js'; // <- at the top of your entry point

Array.from(new Set([1, 2, 3, 2, 1]));          // => [1, 2, 3]
[1, [2, 3], [4, [5]]].flatten(2);              // => [1, 2, 3, 4, 5]
Promise.resolve(32).then(x => console.log(x)); // => 32
```

*You can load only required features*:
```js
import 'core-js/fn/array/from';    // <- at the top of your entry point
import 'core-js/fn/array/flatten'; // <- at the top of your entry point
import 'core-js/fn/set';           // <- at the top of your entry point
import 'core-js/fn/promise';       // <- at the top of your entry point

Array.from(new Set([1, 2, 3, 2, 1]));          // => [1, 2, 3]
[1, [2, 3], [4, [5]]].flatten(2);              // => [1, 2, 3, 4, 5]
Promise.resolve(32).then(x => console.log(x)); // => 32
```

*Or use it without global namespace pollution*:
```js
import from from 'core-js-pure/fn/array/from';
import flatten from 'core-js-pure/fn/array/flatten';
import Set from 'core-js-pure/fn/set';
import Promise from 'core-js-pure/fn/promise';

from(new Set([1, 2, 3, 2, 1]));                // => [1, 2, 3]
flatten([1, [2, 3], [4, [5]]], 2);             // => [1, 2, 3, 4, 5]
Promise.resolve(32).then(x => console.log(x)); // => 32
```

### Index
- [Usage](#usage)
  - [Basic](#basic)
  - [CommonJS](#commonjs)
  - [Custom build](#custom-build)
- [Supported engines](#supported-engines)
- [Features](#features)
  - [ECMAScript](#ecmascript)
    - [ECMAScript: Object](#ecmascript-object)
    - [ECMAScript: Function](#ecmascript-function)
    - [ECMAScript: Array](#ecmascript-array)
    - [ECMAScript: String](#ecmascript-string)
    - [ECMAScript: RegExp](#ecmascript-regexp)
    - [ECMAScript: Number](#ecmascript-number)
    - [ECMAScript: Math](#ecmascript-math)
    - [ECMAScript: Date](#ecmascript-date)
    - [ECMAScript: Promise](#ecmascript-promise)
    - [ECMAScript: Symbol](#ecmascript-symbol)
    - [ECMAScript: Collections](#ecmascript-collections)
    - [ECMAScript: Typed Arrays](#ecmascript-typed-arrays)
    - [ECMAScript: Reflect](#ecmascript-reflect)
  - [ECMAScript proposals](#ecmascript-proposals)
    - [stage 4 proposals](#stage-4-proposals)
    - [stage 3 proposals](#stage-3-proposals)
    - [stage 2 proposals](#stage-2-proposals)
    - [stage 1 proposals](#stage-1-proposals)
    - [stage 0 proposals](#stage-0-proposals)
    - [pre-stage 0 proposals](#pre-stage-0-proposals)
  - [Web standards](#web-standards)
    - [setTimeout / setInterval](#settimeout--setinterval)
    - [setImmediate](#setimmediate)
    - [iterable DOM collections](#iterable-dom-collections)
  - [Iteration helpers](#iteration-helpers)
- [Missing polyfills](#missing-polyfills)
- [Contributing](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

## Usage
### Basic
Installation:
```
npm i core-js
```

```js
// Include all polyfills
require('core-js');
```
If you need already bundled version of `core-js`, use `core-js/client/core.js` or `core-js/client/core.min.js` from `npm` package.

Warning: if you use `core-js` with the extension of native objects, require all needed `core-js` modules at the beginning of entry point of your application, otherwise, conflicts may occur.

### CommonJS
You can require only needed modules, like in examples in examples at the top of `README.md`. Available entry points for methods / constructors and namespaces: for example, `core-js/es/array` (`core-js-pure/es/array`) contains all [ES `Array` features](#ecmascript-array), `core-js/es` (`core-js-pure/es`) contains all ES features.

##### Caveats when using CommonJS API:

* `modules` path is internal API, does not inject all required dependencies and can be changed in minor or patch releases. Use it only for a custom build and / or if you know what are you doing.
* `core-js` is extremely modular and uses a lot of very tiny modules, because of that for usage in browsers bundle up `core-js` instead of usage loader for each file, otherwise, you will have hundreds of requests.

#### CommonJS and prototype methods without global namespace pollution
In the `pure` version, we can't pollute prototypes of native constructors. Because of that, prototype methods transformed to static methods like in examples above. `babel` `runtime` transformer also can't transform them. But with transpilers we can use one more trick - [bind operator and virtual methods](https://github.com/zenparsing/es-function-bind). Special for that, available `/virtual/` entry points. Example:
```js
import fill from 'core-js-pure/fn/array/virtual/fill';
import findIndex from 'core-js-pure/fn/array/virtual/find-index';

Array(10)::fill(0).map((a, b) => b * b)::findIndex(it => it && !(it % 8)); // => 4

// or

import { fill, findIndex } from 'core-js-pure/fn/array/virtual';

Array(10)::fill(0).map((a, b) => b * b)::findIndex(it => it && !(it % 8)); // => 4

```

### Custom build

[`core-js-builder`](https://www.npmjs.com/package/core-js-builder) package exports a function that takes the same parameters as the `build` target from the previous section. This will conditionally include or exclude certain parts of `core-js`:

```js
require('core-js-builder')({
  modules: ['es', 'web'],               // modules / namespaces
  blacklist: ['es.reflect', 'es.math'], // blacklist of modules / namespaces, by default - empty list
}).then(code => {
  // ...
}).catch(error => {
  // ...
});
```
## Supported engines
**Tested in:**
- Chrome 26+
- Firefox 4+
- Safari 5+
- Opera 12+
- Internet Explorer 6+ (sure, IE8- with ES3 limitations)
- Edge
- Android Browser 2.3+
- iOS Safari 5.1+
- PhantomJS 1.9 / 2.1
- NodeJS 0.8+

...and it doesn't mean `core-js` will not work in other engines, they just have not been tested.

## Features:
[*CommonJS entry points:*](#commonjs)
```
core-js(-pure)
```

### ECMAScript
[*CommonJS entry points:*](#commonjs)
```
core-js(-pure)/es
```
#### ECMAScript: Object
Modules [`es.object.assign`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.object.assign.js), [`es.object.is`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.object.is.js), [`es.object.set-prototype-of`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.object.set-prototype-of.js), [`es.object.to-string`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.object.to-string.js), [`es.object.freeze`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.object.freeze.js), [`es.object.seal`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.object.seal.js), [`es.object.prevent-extensions`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.object.prevent-extensions.js), [`es.object.is-frozen`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.object.is-frozen.js), [`es.object.is-sealed`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.object.is-sealed.js), [`es.object.is-extensible`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.object.is-extensible.js), [`es.object.get-own-property-descriptor`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.object.get-own-property-descriptor.js), [`es.object.get-own-property-descriptors`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.object.get-own-property-descriptors.js), [`es.object.get-prototype-of`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.object.get-prototype-of.js), [`es.object.keys`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.object.keys.js), [`es.object.values`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.object.values.js), [`es.object.entries`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.object.entries.js) and [`es.object.get-own-property-names`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.object.get-own-property-names.js).

Just ES5 features: [`es.object.create`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.object.create.js), [`es.object.define-property`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.object.define-property.js) and [`es.object.define-properties`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.object.es.object.define-properties.js).

[ES2017 Annex B](https://tc39.github.io/ecma262/#sec-object.prototype.__defineGetter__) - modules [`es.object.define-setter`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.object.define-setter.js), [`es.object.define-getter`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.object.define-getter.js), [`es.object.lookup-setter`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.object.lookup-setter.js) and [`es.object.lookup-getter`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.object.lookup-getter.js)
```js
class Object {
  toString(): string; // ES2015+ fix: @@toStringTag support
  __defineGetter__(property: PropertyKey, getter: Function): void;
  __defineSetter__(property: PropertyKey, setter: Function): void;
  __lookupGetter__(property: PropertyKey): Function | void;
  __lookupSetter__(property: PropertyKey): Function | void;
  static assign(target: Object, ...sources: Array<Object>): Object;
  static create(prototype: Object | null, properties?: { [property: PropertyKey]: PropertyDescriptor }): Object;
  static defineProperties(object: Object, properties: { [property: PropertyKey]: PropertyDescriptor })): Object;
  static defineProperty(object: Object, property: PropertyKey, attributes: PropertyDescriptor): Object;
  static entries(object: Object): Array<[string, mixed]>;
  static freeze(object: any): any;
  static getOwnPropertyDescriptor(object: any, property: PropertyKey): PropertyDescriptor | void;
  static getOwnPropertyDescriptors(object: any): { [property: PropertyKey]: PropertyDescriptor };
  static getOwnPropertyNames(object: any): Array<string>;
  static getPrototypeOf(object: any): Object | null;
  static is(value1: any, value2: any): boolean;
  static isExtensible(object: any): boolean;
  static isFrozen(object: any): boolean;
  static isSealed(object: any): boolean;
  static keys(object: any): Array<string>;
  static preventExtensions(object: any): any;
  static seal(object: any): any;
  static setPrototypeOf(target: any, prototype: Object | null): any; // required __proto__ - IE11+
  static values(object: any): Array<mixed>;
}
```
[*CommonJS entry points:*](#commonjs)
```
core-js(-pure)/es/object
core-js(-pure)/fn/object/assign
core-js(-pure)/fn/object/is
core-js(-pure)/fn/object/set-prototype-of
core-js(-pure)/fn/object/get-prototype-of
core-js(-pure)/fn/object/create
core-js(-pure)/fn/object/define-property
core-js(-pure)/fn/object/define-properties
core-js(-pure)/fn/object/get-own-property-descriptor
core-js(-pure)/fn/object/get-own-property-descriptors
core-js(-pure)/fn/object/keys
core-js(-pure)/fn/object/values
core-js(-pure)/fn/object/entries
core-js(-pure)/fn/object/get-own-property-names
core-js(-pure)/fn/object/freeze
core-js(-pure)/fn/object/seal
core-js(-pure)/fn/object/prevent-extensions
core-js(-pure)/fn/object/is-frozen
core-js(-pure)/fn/object/is-sealed
core-js(-pure)/fn/object/is-extensible
core-js/fn/object/to-string
core-js(-pure)/fn/object/define-getter
core-js(-pure)/fn/object/define-setter
core-js(-pure)/fn/object/lookup-getter
core-js(-pure)/fn/object/lookup-setter
```
[*Examples*](https://goo.gl/sqY5mD):
```js
let foo = { q: 1, w: 2 };
let bar = { e: 3, r: 4 };
let baz = { t: 5, y: 6 };
Object.assign(foo, bar, baz); // => foo = { q: 1, w: 2, e: 3, r: 4, t: 5, y: 6 }

Object.is(NaN, NaN); // => true
Object.is(0, -0);    // => false
Object.is(42, 42);   // => true
Object.is(42, '42'); // => false

function Parent() {}
function Child() {}
Object.setPrototypeOf(Child.prototype, Parent.prototype);
new Child() instanceof Child;  // => true
new Child() instanceof Parent; // => true

let object = {};
object[Symbol.toStringTag] = 'Foo';
'' + object; // => '[object Foo]'

Object.keys('qwe'); // => ['0', '1', '2']
Object.getPrototypeOf('qwe') === String.prototype; // => true

Object.values({ a: 1, b: 2, c: 3 });  // => [1, 2, 3]
Object.entries({ a: 1, b: 2, c: 3 }); // => [['a', 1], ['b', 2], ['c', 3]]

for (let [key, value] of Object.entries({ a: 1, b: 2, c: 3 })) {
  console.log(key);   // => 'a', 'b', 'c'
  console.log(value); // => 1, 2, 3
}

// Shallow object cloning with prototype and descriptors:
let copy = Object.create(Object.getPrototypeOf(object), Object.getOwnPropertyDescriptors(object));
// Mixin:
Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
```
#### ECMAScript: Function
Modules [`es.function.name`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.function.name.js), [`es.function.has-instance`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.function.has-instance.js). Just ES5: [`es.function.bind`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.function.bind.js).
```js
class Function {
  name: string;
  bind(thisArg: any, ...args: Array<mixed>): Function;
  @@hasInstance(value: any): boolean;
}
```
[*CommonJS entry points:*](#commonjs)
```
core-js/es/function
core-js/fn/function/name
core-js/fn/function/has-instance
core-js/fn/function/bind
core-js/fn/function/virtual/bind
```
[*Example*](http://goo.gl/zqu3Wp):
```js
(function foo() {}).name // => 'foo'

console.log.bind(console, 42)(43); // => 42 43
```
#### ECMAScript: Array
Modules [`es.array.from`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.array.from.js), [`es.array.is-array`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.array.is-array.js), [`es.array.of`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.array.of.js), [`es.array.copy-within`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.array.copy-within.js), [`es.array.fill`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.array.fill.js), [`es.array.find`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.array.find.js), [`es.array.find-index`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.array.find-index.js), [`es.array.iterator`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.array.iterator.js), [`es.array.includes`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.array.includes.js), [`es.array.slice`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.array.slice.js), [`es.array.join`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.array.join.js), [`es.array.index-of`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.array.index-of.js), [`es.array.last-index-of`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.array.last-index-of.js), [`es.array.every`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.array.every.js), [`es.array.some`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.array.some.js), [`es.array.for-each`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.array.for-each.js), [`es.array.map`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.array.map.js), [`es.array.filter`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.array.filter.js), [`es.array.reduce`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.array.reduce.js), [`es.array.reduce-right`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.array.reduce-right.js), [`es.array.sort`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.array.sort.js)
```js
class Array {
  copyWithin(target: number, start: number, end?: number): this;
  entries(): Iterator<[index, value]>;
  every(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): boolean;
  fill(value: any, start?: number, end?: number): this;
  filter(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): Array<mixed>;
  find(callbackfn: (value: any, index: number, target: any) => boolean), thisArg?: any): any;
  findIndex(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): number;
  forEach(callbackfn: (value: any, index: number, target: any) => void, thisArg?: any): void;
  includes(searchElement: any, from?: number): boolean;
  indexOf(searchElement: any, from?: number): number;
  join(separator: string = ','): string;
  keys(): Iterator<index>;
  lastIndexOf(searchElement: any, from?: number): number;
  map(mapFn: (value: any, index: number, target: any) => any, thisArg?: any): Array<mixed>;
  reduce(callbackfn: (memo: any, value: any, index: number, target: any) => any, initialValue?: any): any;
  reduceRight(callbackfn: (memo: any, value: any, index: number, target: any) => any, initialValue?: any): any;
  slice(start?: number, end?: number): Array<mixed>;
  some(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): boolean;
  sort(comparefn?: (a: any, b: any) => number): this;
  values(): Iterator<value>;
  @@iterator(): Iterator<value>;
  @@unscopables: { [newMethodNames: string]: true };
  static from(items: Iterable | ArrayLike, mapFn?: (value: any, index: number) => any, thisArg?: any): Array<mixed>;
  static isArray(value: any): boolean;
  static of(...args: Array<mixed>): Array<mixed>;
}

class Arguments {
  @@iterator(): Iterator<value>; // available only in core-js methods
}
```
[*CommonJS entry points:*](#commonjs)
```
core-js(-pure)/es/array
core-js(-pure)/fn/array/from
core-js(-pure)/fn/array/of
core-js(-pure)/fn/array/is-array
core-js(-pure)/fn/array/includes
core-js(-pure)/fn/array/iterator
core-js(-pure)/fn/array/copy-within
core-js(-pure)/fn/array/fill
core-js(-pure)/fn/array/find
core-js(-pure)/fn/array/find-index
core-js(-pure)/fn/array/includes
core-js(-pure)/fn/array/values
core-js(-pure)/fn/array/keys
core-js(-pure)/fn/array/entries
core-js(-pure)/fn/array/slice
core-js(-pure)/fn/array/join
core-js(-pure)/fn/array/index-of
core-js(-pure)/fn/array/last-index-of
core-js(-pure)/fn/array/every
core-js(-pure)/fn/array/some
core-js(-pure)/fn/array/for-each
core-js(-pure)/fn/array/map
core-js(-pure)/fn/array/filter
core-js(-pure)/fn/array/reduce
core-js(-pure)/fn/array/reduce-right
core-js(-pure)/fn/array/sort
core-js(-pure)/fn/array/virtual/iterator
core-js(-pure)/fn/array/virtual/copy-within
core-js(-pure)/fn/array/virtual/fill
core-js(-pure)/fn/array/virtual/find
core-js(-pure)/fn/array/virtual/find-index
core-js(-pure)/fn/array/virtual/includes
core-js(-pure)/fn/array/virtual/values
core-js(-pure)/fn/array/virtual/keys
core-js(-pure)/fn/array/virtual/entries
core-js(-pure)/fn/array/virtual/slice
core-js(-pure)/fn/array/virtual/join
core-js(-pure)/fn/array/virtual/index-of
core-js(-pure)/fn/array/virtual/last-index-of
core-js(-pure)/fn/array/virtual/every
core-js(-pure)/fn/array/virtual/some
core-js(-pure)/fn/array/virtual/for-each
core-js(-pure)/fn/array/virtual/map
core-js(-pure)/fn/array/virtual/filter
core-js(-pure)/fn/array/virtual/reduce
core-js(-pure)/fn/array/virtual/reduce-right
core-js(-pure)/fn/array/virtual/sort
```
[*Examples*](https://goo.gl/Tegvq4):
```js
Array.from(new Set([1, 2, 3, 2, 1]));        // => [1, 2, 3]
Array.from({ 0: 1, 1: 2, 2: 3, length: 3 }); // => [1, 2, 3]
Array.from('123', Number);                   // => [1, 2, 3]
Array.from('123', it => it * it);            // => [1, 4, 9]

Array.of(1);       // => [1]
Array.of(1, 2, 3); // => [1, 2, 3]

let array = ['a', 'b', 'c'];

for (let value of array) console.log(value);          // => 'a', 'b', 'c'
for (let value of array.values()) console.log(value); // => 'a', 'b', 'c'
for (let key of array.keys()) console.log(key);       // => 0, 1, 2
for (let [key, value] of array.entries()) {
  console.log(key);                                   // => 0, 1, 2
  console.log(value);                                 // => 'a', 'b', 'c'
}

function isOdd(value) {
  return value % 2;
}
[4, 8, 15, 16, 23, 42].find(isOdd);      // => 15
[4, 8, 15, 16, 23, 42].findIndex(isOdd); // => 2
[4, 8, 15, 16, 23, 42].find(isNaN);      // => undefined
[4, 8, 15, 16, 23, 42].findIndex(isNaN); // => -1

Array(5).fill(42); // => [42, 42, 42, 42, 42]

[1, 2, 3, 4, 5].copyWithin(0, 3); // => [4, 5, 3, 4, 5]


[1, 2, 3].includes(2);        // => true
[1, 2, 3].includes(4);        // => false
[1, 2, 3].includes(2, 2);     // => false

[NaN].indexOf(NaN);           // => -1
[NaN].includes(NaN);          // => true
Array(1).indexOf(undefined);  // => -1
Array(1).includes(undefined); // => true
```
#### ECMAScript: String
Modules [`es.string.from-code-point`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.string.from-code-point.js), [`es.string.raw`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.string.raw.js), [`es.string.iterator`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.string.iterator.js), [`es.string.split`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.string.split.js), [`es.string.code-point-at`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.string.code-point-at.js), [`es.string.ends-with`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.string.ends-with.js), [`es.string.includes`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.string.includes.js), [`es.string.repeat`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.string.repeat.js), [`es.string.pad-start`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.string.pad-start.js), [`es.string.pad-end`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.string.pad-end.js), [`es.string.starts-with`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.string.starts-with.js) and [`es.string.trim`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.string.trim.js).

Annex B HTML methods. Ugly, but it's also the part of the spec. Modules [`es.string.anchor`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.string.anchor.js), [`es.string.big`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.string.big.js), [`es.string.blink`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.string.blink.js), [`es.string.bold`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.string.bold.js), [`es.string.fixed`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.string.fixed.js), [`es.string.fontcolor`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.string.fontcolor.js), [`es.string.fontsize`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.string.fontsize.js), [`es.string.italics`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.string.italics.js), [`es.string.link`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.string.link.js), [`es.string.small`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.string.small.js), [`es.string.strike`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.string.strike.js), [`es.string.sub`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.string.sub.js) and [`es.string.sup`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.string.sup.js).
```js
class String {
  static fromCodePoint(...codePoints: Array<number>): string;
  static raw({ raw: Array<string> }, ...substitutions: Array<string>): string;
  split(separator: string, limit?: number): Array<string>;
  includes(searchString: string, position?: number): boolean;
  startsWith(searchString: string, position?: number): boolean;
  endsWith(searchString: string, position?: number): boolean;
  repeat(count: number): string;
  padStart(length: number, fillStr?: string = ' '): string;
  padEnd(length: number, fillStr?: string = ' '): string;
  codePointAt(pos: number): number | void;
  trim(): string;
  anchor(name: string): string;
  big(): string;
  blink(): string;
  bold(): string;
  fixed(): string;
  fontcolor(color: string): string;
  fontsize(size: any): string;
  italics(): string;
  link(url: string): string;
  small(): string;
  strike(): string;
  sub(): string;
  sup(): string;
  @@iterator(): Iterator<characters>;
}
```
[*CommonJS entry points:*](#commonjs)
```
core-js(-pure)/es/string
core-js(-pure)/fn/string/from-code-point
core-js(-pure)/fn/string/raw
core-js(-pure)/fn/string/includes
core-js(-pure)/fn/string/starts-with
core-js(-pure)/fn/string/ends-with
core-js(-pure)/fn/string/repeat
core-js(-pure)/fn/string/pad-start
core-js(-pure)/fn/string/pad-end
core-js(-pure)/fn/string/code-point-at
core-js(-pure)/fn/string/trim
core-js(-pure)/fn/string/anchor
core-js(-pure)/fn/string/big
core-js(-pure)/fn/string/blink
core-js(-pure)/fn/string/bold
core-js(-pure)/fn/string/fixed
core-js(-pure)/fn/string/fontcolor
core-js(-pure)/fn/string/fontsize
core-js(-pure)/fn/string/italics
core-js(-pure)/fn/string/link
core-js(-pure)/fn/string/small
core-js(-pure)/fn/string/strike
core-js(-pure)/fn/string/sub
core-js(-pure)/fn/string/sup
core-js(-pure)/fn/string/iterator
core-js(-pure)/fn/string/virtual/includes
core-js(-pure)/fn/string/virtual/starts-with
core-js(-pure)/fn/string/virtual/ends-with
core-js(-pure)/fn/string/virtual/repeat
core-js(-pure)/fn/string/virtual/pad-start
core-js(-pure)/fn/string/virtual/pad-end
core-js(-pure)/fn/string/virtual/code-point-at
core-js(-pure)/fn/string/virtual/trim
core-js(-pure)/fn/string/virtual/anchor
core-js(-pure)/fn/string/virtual/big
core-js(-pure)/fn/string/virtual/blink
core-js(-pure)/fn/string/virtual/bold
core-js(-pure)/fn/string/virtual/fixed
core-js(-pure)/fn/string/virtual/fontcolor
core-js(-pure)/fn/string/virtual/fontsize
core-js(-pure)/fn/string/virtual/italics
core-js(-pure)/fn/string/virtual/link
core-js(-pure)/fn/string/virtual/small
core-js(-pure)/fn/string/virtual/strike
core-js(-pure)/fn/string/virtual/sub
core-js(-pure)/fn/string/virtual/sup
core-js(-pure)/fn/string/virtual/iterator
```
[*Examples*](https://goo.gl/oVvKga):
```js
for (let value of 'a𠮷b') {
  console.log(value); // => 'a', '𠮷', 'b'
}

'foobarbaz'.includes('bar');      // => true
'foobarbaz'.includes('bar', 4);   // => false
'foobarbaz'.startsWith('foo');    // => true
'foobarbaz'.startsWith('bar', 3); // => true
'foobarbaz'.endsWith('baz');      // => true
'foobarbaz'.endsWith('bar', 6);   // => true

'string'.repeat(3); // => 'stringstringstring'

'hello'.padStart(10);         // => '     hello'
'hello'.padStart(10, '1234'); // => '12341hello'
'hello'.padEnd(10);           // => 'hello     '
'hello'.padEnd(10, '1234');   // => 'hello12341'

'𠮷'.codePointAt(0); // => 134071
String.fromCodePoint(97, 134071, 98); // => 'a𠮷b'

let name = 'Bob';
String.raw`Hi\n${name}!`;             // => 'Hi\\nBob!' (ES2015 template string syntax)
String.raw({ raw: 'test' }, 0, 1, 2); // => 't0e1s2t'

'foo'.bold();                     // => '<b>foo</b>'
'bar'.anchor('a"b');              // => '<a name="a&quot;b">bar</a>'
'baz'.link('http://example.com'); // => '<a href="http://example.com">baz</a>'
```
#### ECMAScript: RegExp
Modules [`es.regexp.constructor`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.regexp.constructor.js) and [`es.regexp.flags`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.regexp.flags.js).

Support well-known [symbols](#ecmascript-symbol) `@@match`, `@@replace`, `@@search` and `@@split`, modules [`es.regexp.match`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.regexp.match.js), [`es.regexp.replace`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.regexp.replace.js), [`es.regexp.search`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.regexp.search.js) and [`es.regexp.split`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.regexp.split.js).
```js
class RegExp {
  constructor(pattern: RegExp | string, flags?: string): RegExp; // ES2015+ fix - can alter flags (IE9+)
  toString(): string; // ES2015+ fix - generic
  @@match(string: string): Array | null;
  @@replace(string: string, replaceValue: Function | string): string;
  @@search(string: string): number;
  @@split(string: string, limit: number): Array<string>;
  get flags: string; // IE9+
}

class String {
  match(template: any): any; // ES2015+ fix for support @@match
  replace(template: any, replacer: any): any; // ES2015+ fix for support @@replace
  search(template: any): any; // ES2015+ fix for support @@search
  split(template: any, limit: any): any; // ES2015+ fix for support @@split, some fixes for old engines
}
```
[*CommonJS entry points:*](#commonjs)
```
core-js/es/regexp
core-js/fn/regexp/constructor
core-js(-pure)/fn/regexp/flags
core-js/fn/regexp/to-string
core-js/fn/regexp/match
core-js/fn/regexp/replace
core-js/fn/regexp/search
core-js/fn/regexp/split
```
[*Examples*](http://goo.gl/PiJxBD):
```js
RegExp(/./g, 'm'); // => /./m

/foo/.flags;    // => ''
/foo/gim.flags; // => 'gim'

'foo'.match({ [Symbol.match]: () => 1 });     // => 1
'foo'.replace({ [Symbol.replace]: () => 2 }); // => 2
'foo'.search({ [Symbol.search]: () => 3 });   // => 3
'foo'.split({ [Symbol.split]: () => 4 });     // => 4

RegExp.prototype.toString.call({ source: 'foo', flags: 'bar' }); // => '/foo/bar'
```
#### ECMAScript: Number
Module [`es.number.constructor`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.number.constructor.js). `Number` constructor support binary and octal literals, [*example*](http://goo.gl/jRd6b3):
```js
Number('0b1010101'); // => 85
Number('0o7654321'); // => 2054353
```
Modules [`es.number.epsilon`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.number.epsilon.js), [`es.number.is-finite`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.number.is-finite.js), [`es.number.is-integer`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.number.is-integer.js), [`es.number.is-nan`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.number.is-nan.js), [`es.number.is-safe-integer`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.number.is-safe-integer.js), [`es.number.max-safe-integer`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.number.max-safe-integer.js), [`es.number.min-safe-integer`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.number.min-safe-integer.js), [`es.number.parse-float`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.number.parse-float.js), [`es.number.parse-int`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.number.parse-int.js), [`es.number.to-fixed`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.number.to-fixed.js), [`es.number.to-precision`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.number.to-precision.js), [`es.parse-int`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.parse-int.js), [`es.parse-float`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.parse-float.js).
```js
class Number {
  constructor(value: any): number;
  toFixed(digits: number): string;
  toPrecision(precision: number): string;
  static isFinite(number: any): boolean;
  static isNaN(number: any): boolean;
  static isInteger(number: any): boolean;
  static isSafeInteger(number: any): boolean;
  static parseFloat(string: string): number;
  static parseInt(string: string, radix?: number = 10): number;
  static EPSILON: number;
  static MAX_SAFE_INTEGER: number;
  static MIN_SAFE_INTEGER: number;
}

function parseFloat(string: string): number;
function parseInt(string: string, radix?: number = 10): number;
```
[*CommonJS entry points:*](#commonjs)
```
core-js(-pure)/es/number
core-js/es/number/constructor
core-js(-pure)/fn/number/is-finite
core-js(-pure)/fn/number/is-nan
core-js(-pure)/fn/number/is-integer
core-js(-pure)/fn/number/is-safe-integer
core-js(-pure)/fn/number/parse-float
core-js(-pure)/fn/number/parse-int
core-js(-pure)/fn/number/epsilon
core-js(-pure)/fn/number/max-safe-integer
core-js(-pure)/fn/number/min-safe-integer
core-js(-pure)/fn/number/to-fixed
core-js(-pure)/fn/number/to-precision
core-js(-pure)/fn/parse-float
core-js(-pure)/fn/parse-int
```
#### ECMAScript: Math
Modules [`es.math.acosh`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.math.acosh.js), [`es.math.asinh`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.math.asinh.js), [`es.math.atanh`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.math.atanh.js), [`es.math.cbrt`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.math.cbrt.js), [`es.math.clz32`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.math.clz32.js), [`es.math.cosh`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.math.cosh.js), [`es.math.expm1`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.math.expm1.js), [`es.math.fround`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.math.fround.js), [`es.math.hypot`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.math.hypot.js), [`es.math.imul`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.math.imul.js), [`es.math.log10`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.math.log10.js), [`es.math.log1p`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.math.log1p.js), [`es.math.log2`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.math.log2.js), [`es.math.sign`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.math.sign.js), [`es.math.sinh`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.math.sinh.js), [`es.math.tanh`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.math.tanh.js), [`es.math.trunc`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.math.trunc.js).
```js
namespace Math {
  acosh(number: number): number;
  asinh(number: number): number;
  atanh(number: number): number;
  cbrt(number: number): number;
  clz32(number: number): number;
  cosh(number: number): number;
  expm1(number: number): number;
  fround(number: number): number;
  hypot(...args: Array<number>): number;
  imul(number1: number, number2: number): number;
  log1p(number: number): number;
  log10(number: number): number;
  log2(number: number): number;
  sign(number: number): 1 | -1 | 0 | -0 | NaN;
  sinh(number: number): number;
  tanh(number: number): number;
  trunc(number: number): number;
}
```
[*CommonJS entry points:*](#commonjs)
```
core-js(-pure)/es/math
core-js(-pure)/fn/math/acosh
core-js(-pure)/fn/math/asinh
core-js(-pure)/fn/math/atanh
core-js(-pure)/fn/math/cbrt
core-js(-pure)/fn/math/clz32
core-js(-pure)/fn/math/cosh
core-js(-pure)/fn/math/expm1
core-js(-pure)/fn/math/fround
core-js(-pure)/fn/math/hypot
core-js(-pure)/fn/math/imul
core-js(-pure)/fn/math/log1p
core-js(-pure)/fn/math/log10
core-js(-pure)/fn/math/log2
core-js(-pure)/fn/math/sign
core-js(-pure)/fn/math/sinh
core-js(-pure)/fn/math/tanh
core-js(-pure)/fn/math/trunc
```
#### ECMAScript: Date
Modules [`es.date.to-string`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.date.to-string.js), ES5 features with fixes: [`es.date.now`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.date.now.js), [`es.date.to-iso-string`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.date.to-iso-string.js), [`es.date.to-json`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.date.to-json.js) and [`es.date.to-primitive`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.date.to-primitive.js).
```js
class Date {
  toISOString(): string;
  toJSON(): string;
  toString(): string;
  @@toPrimitive(hint: 'default' | 'number' | 'string'): string | number;
  static now(): number;
}
```
[*CommonJS entry points:*](#commonjs)
```
core-js/es/date
core-js/fn/date/to-string
core-js(-pure)/fn/date/now
core-js(-pure)/fn/date/to-iso-string
core-js(-pure)/fn/date/to-json
core-js(-pure)/fn/date/to-primitive
```
[*Example*](http://goo.gl/haeHLR):
```js
new Date(NaN).toString(); // => 'Invalid Date'
```

#### ECMAScript: Promise
Module [`es.promise`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.promise.js).
```js
class Promise {
  constructor(executor: (resolve: Function, reject: Function) => void): Promise;
  then(onFulfilled: Function, onRejected: Function): Promise;
  catch(onRejected: Function): Promise;
  static resolve(x: any): Promise;
  static reject(r: any): Promise;
  static all(iterable: Iterable): Promise;
  static race(iterable: Iterable): Promise;
}
```
[*CommonJS entry points:*](#commonjs)
```
core-js(-pure)/es/promise
core-js(-pure)/fn/promise
```
Basic [*example*](http://goo.gl/vGrtUC):
```js
function sleepRandom(time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time * 1e3, 0 | Math.random() * 1e3);
  });
}

console.log('Run');                    // => Run
sleepRandom(5).then(result => {
  console.log(result);                 // => 869, after 5 sec.
  return sleepRandom(10);
}).then(result => {
  console.log(result);                 // => 202, after 10 sec.
}).then(() => {
  console.log('immediately after');    // => immediately after
  throw Error('Irror!');
}).then(() => {
  console.log('will not be displayed');
}).catch(x => console.log(x));         // => => Error: Irror!
```
`Promise.resolve` and `Promise.reject` [*example*](http://goo.gl/vr8TN3):
```js
Promise.resolve(42).then(x => console.log(x)); // => 42
Promise.reject(42).catch(x => console.log(x)); // => 42

Promise.resolve($.getJSON('/data.json')); // => ES promise
```
`Promise.all` [*example*](http://goo.gl/RdoDBZ):
```js
Promise.all([
  'foo',
  sleepRandom(5),
  sleepRandom(15),
  sleepRandom(10)             // after 15 sec:
]).then(x => console.log(x)); // => ['foo', 956, 85, 382]
```
`Promise.race` [*example*](http://goo.gl/L8ovkJ):
```js
function timeLimit(promise, time) {
  return Promise.race([promise, new Promise((resolve, reject) => {
    setTimeout(reject, time * 1e3, Error('Await > ' + time + ' sec'));
  })]);
}

timeLimit(sleepRandom(5), 10).then(x => console.log(x));   // => 853, after 5 sec.
timeLimit(sleepRandom(15), 10).catch(x => console.log(x)); // Error: Await > 10 sec
```
With [async functions](https://tc39.github.io/ecmascript-asyncawait) [example](http://goo.gl/wnQS4j):
```js
let delay = time => new Promise(resolve => setTimeout(resolve, time))

async function sleepRandom(time) {
  await delay(time * 1e3);
  return 0 | Math.random() * 1e3;
}

async function sleepError(time, msg) {
  await delay(time * 1e3);
  throw Error(msg);
}

(async () => {
  try {
    console.log('Run');                // => Run
    console.log(await sleepRandom(5)); // => 936, after 5 sec.
    let [a, b, c] = await Promise.all([
      sleepRandom(5),
      sleepRandom(15),
      sleepRandom(10)
    ]);
    console.log(a, b, c);              // => 210 445 71, after 15 sec.
    await sleepError(5, 'Error!');
    console.log('Will not be displayed');
  } catch (e) {
    console.log(e);                    // => Error: 'Error!', after 5 sec.
  }
})();
```

##### Unhandled rejection tracking

In Node.js, like in native implementation, available events [`unhandledRejection`](https://nodejs.org/api/process.html#process_event_unhandledrejection) and [`rejectionHandled`](https://nodejs.org/api/process.html#process_event_rejectionhandled):
```js
process.on('unhandledRejection', (reason, promise) => console.log('unhandled', reason, promise));
process.on('rejectionHandled', (promise) => console.log('handled', promise));

let promise = Promise.reject(42);
// unhandled 42 [object Promise]

setTimeout(() => promise.catch(() => {}), 1e3);
// handled [object Promise]
```
In a browser on rejection, by default, you will see notify in the console, or you can add a custom handler and a handler on handling unhandled, [*example*](http://goo.gl/Wozskl):
```js
window.addEventListener('unhandledrejection', e => console.log('unhandled', e.reason, e.promise));
window.addEventListener('rejectionhandled', e => console.log('handled', e.reason, e.promise));
// or
window.onunhandledrejection = e => console.log('unhandled', e.reason, e.promise);
window.onrejectionhandled = e => console.log('handled', e.reason, e.promise);

let promise = Promise.reject(42);
// => unhandled 42 [object Promise]

setTimeout(() => promise.catch(() => {}), 1e3);
// => handled 42 [object Promise]
```

#### ECMAScript: Symbol
Module [`es.symbol`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.symbol.js).
```js
class Symbol {
  constructor(description?): symbol;
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
  static useSimple(): void;
  static useSetter(): void;
}

class Object {
  static getOwnPropertySymbols(object: any): Array<symbol>;
}
```
Also wrapped some methods for correct work with `Symbol` polyfill.
```js
class Object {
  static create(prototype: Object | null, properties?: { [property: PropertyKey]: PropertyDescriptor }): Object;
  static defineProperties(object: Object, properties: { [property: PropertyKey]: PropertyDescriptor })): Object;
  static defineProperty(object: Object, property: PropertyKey, attributes: PropertyDescriptor): Object;
  static getOwnPropertyDescriptor(object: any, property: PropertyKey): PropertyDescriptor | void;
  static getOwnPropertyNames(object: any): Array<string>;
  propertyIsEnumerable(key: PropertyKey): boolean;
}

namespace JSON {
  stringify(target: any, replacer?: Function | Array, space?: string | number): string | void;
}
```
[*CommonJS entry points:*](#commonjs)
```
core-js(-pure)/es/symbol
core-js(-pure)/fn/symbol
core-js(-pure)/fn/symbol/has-instance
core-js(-pure)/fn/symbol/is-concat-spreadable
core-js(-pure)/fn/symbol/iterator
core-js(-pure)/fn/symbol/match
core-js(-pure)/fn/symbol/replace
core-js(-pure)/fn/symbol/search
core-js(-pure)/fn/symbol/species
core-js(-pure)/fn/symbol/split
core-js(-pure)/fn/symbol/to-primitive
core-js(-pure)/fn/symbol/to-string-tag
core-js(-pure)/fn/symbol/unscopables
core-js(-pure)/fn/symbol/for
core-js(-pure)/fn/symbol/key-for
```
[*Basic example*](http://goo.gl/BbvWFc):
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
  }
})();

let person = new Person('Vasya');
console.log(person.getName());            // => 'Vasya'
console.log(person['name']);              // => undefined
console.log(person[Symbol('name')]);      // => undefined, symbols are uniq
for (let key in person) console.log(key); // => nothing, symbols are not enumerable
```
`Symbol.for` & `Symbol.keyFor` [*example*](http://goo.gl/0pdJjX):
```js
let symbol = Symbol.for('key');
symbol === Symbol.for('key'); // true
Symbol.keyFor(symbol);        // 'key'
```
[*Example*](http://goo.gl/mKVOQJ) with methods for getting own object keys:
```js
let object = { a: 1 };
Object.defineProperty(object, 'b', { value: 2 });
object[Symbol('c')] = 3;
Object.keys(object);                  // => ['a']
Object.getOwnPropertyNames(object);   // => ['a', 'b']
Object.getOwnPropertySymbols(object); // => [Symbol(c)]
Reflect.ownKeys(object);              // => ['a', 'b', Symbol(c)]
```
##### Caveats when using `Symbol` polyfill:

* We can't add new primitive type, `Symbol` returns object.
* `Symbol.for` and `Symbol.keyFor` can't be shimmed cross-realm.
* By default, to hide the keys, `Symbol` polyfill defines setter in `Object.prototype`. For this reason, uncontrolled creation of symbols can cause memory leak and the `in` operator is not working correctly with `Symbol` polyfill: `Symbol() in {} // => true`.

You can disable defining setters in `Object.prototype`. [Example](http://goo.gl/N5UD7J):
```js
Symbol.useSimple();
let symbol1 = Symbol('symbol1');
let object1 = {};
object1[symbol1] = true;
for (let key in object1) console.log(key); // => 'Symbol(symbol1)_t.qamkg9f3q', w/o native Symbol

Symbol.useSetter();
let symbol2 = Symbol('symbol2');
let object2 = {};
object2[symbol2] = true;
for (let key in object2) console.log(key); // nothing
```
* Currently, `core-js` not adds setters to `Object.prototype` for well-known symbols for correct work something like `Symbol.iterator in foo`. It can cause problems with their enumerability.
* Some problems possible with environment exotic objects (for example, IE `localStorage`).

#### ECMAScript: Collections
`core-js` uses native collections in most case, just fixes methods / constructor, if it's required, and in old environment uses fast polyfill (O(1) lookup).
#### Map
Module [`es.map`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.map.js).
```js
class Map {
  constructor(iterable?: Iterable<[key, value]>): Map;
  clear(): void;
  delete(key: any): boolean;
  forEach(callbackfn: (value: any, key: any, target: any) => void, thisArg: any): void;
  get(key: any): any;
  has(key: any): boolean;
  set(key: any, val: any): this;
  values(): Iterator<value>;
  keys(): Iterator<key>;
  entries(): Iterator<[key, value]>;
  @@iterator(): Iterator<[key, value]>;
  get size: number;
}
```
[*CommonJS entry points:*](#commonjs)
```
core-js(-pure)/es/map
core-js(-pure)/fn/map
```
[*Examples*](http://goo.gl/GWR7NI):
```js
let array = [1];

let map = new Map([['a', 1], [42, 2]]);
map.set(array, 3).set(true, 4);

console.log(map.size);        // => 4
console.log(map.has(array));  // => true
console.log(map.has([1]));    // => false
console.log(map.get(array));  // => 3
map.forEach((val, key) => {
  console.log(val);           // => 1, 2, 3, 4
  console.log(key);           // => 'a', 42, [1], true
});
map.delete(array);
console.log(map.size);        // => 3
console.log(map.get(array));  // => undefined
console.log(Array.from(map)); // => [['a', 1], [42, 2], [true, 4]]

let map = new Map([['a', 1], ['b', 2], ['c', 3]]);

for (let [key, value] of map) {
  console.log(key);                                 // => 'a', 'b', 'c'
  console.log(value);                               // => 1, 2, 3
}
for (let value of map.values()) console.log(value); // => 1, 2, 3
for (let key of map.keys()) console.log(key);       // => 'a', 'b', 'c'
for (let [key, value] of map.entries()) {
  console.log(key);                                 // => 'a', 'b', 'c'
  console.log(value);                               // => 1, 2, 3
}
```
#### Set
Module [`es.set`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.set.js).
```js
class Set {
  constructor(iterable?: Iterable<value>): Set;
  add(key: any): this;
  clear(): void;
  delete(key: any): boolean;
  forEach((value: any, key: any, target: any) => void, thisArg: any): void;
  has(key: any): boolean;
  values(): Iterator<value>;
  keys(): Iterator<value>;
  entries(): Iterator<[value, value]>;
  @@iterator(): Iterator<value>;
  get size: number;
}
```
[*CommonJS entry points:*](#commonjs)
```
core-js(-pure)/es/set
core-js(-pure)/fn/set
```
[*Examples*](http://goo.gl/bmhLwg):
```js
let set = new Set(['a', 'b', 'a', 'c']);
set.add('d').add('b').add('e');
console.log(set.size);        // => 5
console.log(set.has('b'));    // => true
set.forEach(it => {
  console.log(it);            // => 'a', 'b', 'c', 'd', 'e'
});
set.delete('b');
console.log(set.size);        // => 4
console.log(set.has('b'));    // => false
console.log(Array.from(set)); // => ['a', 'c', 'd', 'e']

let set = new Set([1, 2, 3, 2, 1]);

for (let value of set) console.log(value);          // => 1, 2, 3
for (let value of set.values()) console.log(value); // => 1, 2, 3
for (let key of set.keys()) console.log(key);       // => 1, 2, 3
for (let [key, value] of set.entries()) {
  console.log(key);                                 // => 1, 2, 3
  console.log(value);                               // => 1, 2, 3
}
```
#### WeakMap
Module [`es.weak-map`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.weak-map.js).
```js
class WeakMap {
  constructor(iterable?: Iterable<[key, value]>): WeakMap;
  delete(key: Object): boolean;
  get(key: Object): any;
  has(key: Object): boolean;
  set(key: Object, val: any): this;
}
```
[*CommonJS entry points:*](#commonjs)
```
core-js(-pure)/es/weak-map
core-js(-pure)/fn/weak-map
```
[*Examples*](http://goo.gl/SILXyw):
```js
let a = [1];
let b = [2];
let c = [3];

let weakmap = new WeakMap([[a, 1], [b, 2]]);
weakmap.set(c, 3).set(b, 4);
console.log(weakmap.has(a));   // => true
console.log(weakmap.has([1])); // => false
console.log(weakmap.get(a));   // => 1
weakmap.delete(a);
console.log(weakmap.get(a));   // => undefined

// Private properties store:
let Person = (() => {
  let names = new WeakMap;
  return class {
    constructor(name) {
      names.set(this, name);
    }
    getName() {
      return names.get(this);
    }
  }
})();

let person = new Person('Vasya');
console.log(person.getName());            // => 'Vasya'
for (let key in person) console.log(key); // => only 'getName'
```
#### WeakSet
Module [`es.weak-set`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.weak-set.js).
```js
class WeakSet {
  constructor(iterable?: Iterable<value>): WeakSet;
  add(key: Object): this;
  delete(key: Object): boolean;
  has(key: Object): boolean;
}
```
[*CommonJS entry points:*](#commonjs)
```
core-js(-pure)/es/weak-set
core-js(-pure)/fn/weak-set
```
[*Examples*](http://goo.gl/TdFbEx):
```js
let a = [1];
let b = [2];
let c = [3];

let weakset = new WeakSet([a, b, a]);
weakset.add(c).add(b).add(c);
console.log(weakset.has(b));   // => true
console.log(weakset.has([2])); // => false
weakset.delete(b);
console.log(weakset.has(b));   // => false
```
##### Caveats when using collections polyfill:

* Weak-collections polyfill stores values as hidden properties of keys. It works correct and not leak in most cases. However, it is desirable to store a collection longer than its keys.

#### ECMAScript: Typed Arrays
Implementations and fixes `ArrayBuffer`, `DataView`, typed arrays constructors, static and prototype methods. Typed Arrays work only in environments with support descriptors (IE9+), `ArrayBuffer` and `DataView` should work anywhere.

Modules [`es.typed.array-buffer`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.typed.array-buffer.js), [`es.typed.data-view`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.typed.data-view.js), [`es.typed.int8-array`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.typed.int8-array.js), [`es.typed.uint8-array`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.typed.uint8-array.js), [`es.typed.uint8-clamped-array`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.typed.uint8-clamped-array.js), [`es.typed.int16-array`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.typed.int16-array.js), [`es.typed.uint16-array`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.typed.uint16-array.js), [`es.typed.int32-array`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.typed.int32-array.js), [`es.typed.uint32-array`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.typed.uint32-array.js), [`es.typed.float32-array`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.typed.float32-array.js) and [`es.typed.float64-array`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.typed.float64-array.js).
```js
class ArrayBuffer {
  constructor(length: any): ArrayBuffer;
  slice(start: any, end: any): ArrayBuffer;
  get byteLength: number;
  static isView(arg: any): boolean;
}

class DataView {
  constructor(buffer: ArrayBuffer, byteOffset?: number, byteLength?: number): DataView;
  getInt8(offset: any): int8;
  getUint8(offset: any): uint8
  getInt16(offset: any, littleEndian?: boolean = false): int16;
  getUint16(offset: any, littleEndian?: boolean = false): uint16;
  getInt32(offset: any, littleEndian?: boolean = false): int32;
  getUint32(offset: any, littleEndian?: boolean = false): uint32;
  getFloat32(offset: any, littleEndian?: boolean = false): float32;
  getFloat64(offset: any, littleEndian?: boolean = false): float64;
  setInt8(offset: any, value: any): void;
  setUint8(offset: any, value: any): void;
  setInt16(offset: any, value: any, littleEndian?: boolean = false): void;
  setUint16(offset: any, value: any, littleEndian?: boolean = false): void;
  setInt32(offset: any, value: any, littleEndian?: boolean = false): void;
  setUint32(offset: any, value: any, littleEndian?: boolean = false): void;
  setFloat32(offset: any, value: any, littleEndian?: boolean = false): void;
  setFloat64(offset: any, value: any, littleEndian?: boolean = false): void;
  get buffer: ArrayBuffer;
  get byteLength: number;
  get byteOffset: number;
}

class [
  Int8Array,
  Uint8Array,
  Uint8ClampedArray,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array,
] {
  constructor(length: number): %TypedArray%;
  constructor(object: %TypedArray% | Iterable | ArrayLike): %TypedArray%;
  constructor(buffer: ArrayBuffer, byteOffset?: number, length?: number): %TypedArray%;
  copyWithin(target: number, start: number, end?: number): this;
  every(callbackfn: (value: number, index: number, target: any) => boolean, thisArg?: any): boolean;
  fill(value: number, start?: number, end?: number): this;
  filter(callbackfn: (value: number, index: number, target: any) => boolean, thisArg?: any): %TypedArray%;
  find(callbackfn: (value: number, index: number, target: any) => boolean), thisArg?: any): any;
  findIndex(callbackfn: (value: number, index: number, target: any) => boolean, thisArg?: any): number;
  forEach(callbackfn: (value: number, index: number, target: any) => void, thisArg?: any): void;
  includes(searchElement: any, from?: number): boolean;
  indexOf(searchElement: any, from?: number): number;
  join(separator: string = ','): string;
  lastIndexOf(searchElement: any, from?: number): number;
  map(mapFn: (value: number, index: number, target: any) => number, thisArg?: any): %TypedArray%;
  reduce(callbackfn: (memo: any, value: number, index: number, target: any) => any, initialValue?: any): any;
  reduceRight(callbackfn: (memo: any, value: number, index: number, target: any) => any, initialValue?: any): any;
  reverse(): this;
  set(array: ArrayLike, offset?: number): void;
  slice(start?: number, end?: number): %TypedArray%;
  some(callbackfn: (value: number, index: number, target: any) => boolean, thisArg?: any): boolean;
  sort(comparefn?: (a: number, b: number) => number): this;
  subarray(begin?: number, end?: number): %TypedArray%;
  toString(): string;
  toLocaleString(): string;
  values(): Iterator<value>;
  keys(): Iterator<index>;
  entries(): Iterator<[index, value]>;
  @@iterator(): Iterator<value>;
  get buffer: ArrayBuffer;
  get byteLength: number;
  get byteOffset: number;
  get length: number;
  BYTES_PER_ELEMENT: number;
  static from(items: Iterable | ArrayLike, mapFn?: (value: any, index: number) => any, thisArg?: any): %TypedArray%;
  static of(...args: Array<mixed>): %TypedArray%;
  static BYTES_PER_ELEMENT: number;
}
```
[*CommonJS entry points:*](#commonjs)
```
core-js(-pure)/es/typed
core-js(-pure)/fn/typed
core-js(-pure)/fn/typed/array-buffer
core-js(-pure)/fn/typed/data-view
core-js(-pure)/fn/typed/int8-array
core-js(-pure)/fn/typed/uint8-array
core-js(-pure)/fn/typed/uint8-clamped-array
core-js(-pure)/fn/typed/int16-array
core-js(-pure)/fn/typed/uint16-array
core-js(-pure)/fn/typed/int32-array
core-js(-pure)/fn/typed/uint32-array
core-js(-pure)/fn/typed/float32-array
core-js(-pure)/fn/typed/float64-array
```
[*Examples*](http://goo.gl/yla75z):
```js
new Int32Array(4);                          // => [0, 0, 0, 0]
new Uint8ClampedArray([1, 2, 3, 666]);      // => [1, 2, 3, 255]
new Float32Array(new Set([1, 2, 3, 2, 1])); // => [1, 2, 3]

let buffer = new ArrayBuffer(8);
let view   = new DataView(buffer);
view.setFloat64(0, 123.456, true);
new Uint8Array(buffer.slice(4)); // => [47, 221, 94, 64]

Int8Array.of(1, 1.5, 5.7, 745);      // => [1, 1, 5, -23]
Uint8Array.from([1, 1.5, 5.7, 745]); // => [1, 1, 5, 233]

let typed = new Uint8Array([1, 2, 3]);

let a = typed.slice(1);    // => [2, 3]
typed.buffer === a.buffer; // => false
let b = typed.subarray(1); // => [2, 3]
typed.buffer === b.buffer; // => true

typed.filter(it => it % 2); // => [1, 3]
typed.map(it => it * 1.5);  // => [1, 3, 4]

for (let value of typed) console.log(value);          // => 1, 2, 3
for (let value of typed.values()) console.log(value); // => 1, 2, 3
for (let key of typed.keys()) console.log(key);       // => 0, 1, 2
for (let [key, value] of typed.entries()) {
  console.log(key);                                   // => 0, 1, 2
  console.log(value);                                 // => 1, 2, 3
}
```
##### Caveats when using typed arrays:

* Typed Arrays polyfills works completely how should work by the spec, but because of internal use getter / setters on each instance, is slow and consumes significant memory. However, typed arrays polyfills required mainly for IE9 (and for `Uint8ClampedArray` in IE10 and early IE11), all modern engines have native typed arrays and requires only constructors fixes and methods.
* The current version hasn't special entry points for methods, they can be added only with constructors. It can be added in the future.
* In the `pure` version we can't pollute native prototypes, so prototype methods available as constructors static.

#### ECMAScript: Reflect
Modules [`es.reflect.apply`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.reflect.apply.js), [`es.reflect.construct`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.reflect.construct.js), [`es.reflect.define-property`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.reflect.define-property.js), [`es.reflect.delete-property`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.reflect.delete-property.js), [`es.reflect.get`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.reflect.get.js), [`es.reflect.get-own-property-descriptor`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.reflect.get-own-property-descriptor.js), [`es.reflect.get-prototype-of`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.reflect.get-prototype-of.js), [`es.reflect.has`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.reflect.has.js), [`es.reflect.is-extensible`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.reflect.is-extensible.js), [`es.reflect.own-keys`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.reflect.own-keys.js), [`es.reflect.prevent-extensions`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.reflect.prevent-extensions.js), [`es.reflect.set`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.reflect.set.js), [`es.reflect.set-prototype-of`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/es.reflect.set-prototype-of.js).
```js
namespace Reflect {
  apply(target: Function, thisArgument: any, argumentsList: Array<mixed>): any;
  construct(target: Function, argumentsList: Array<mixed>, newTarget?: Function): Object;
  defineProperty(target: Object, propertyKey: PropertyKey, attributes: PropertyDescriptor): boolean;
  deleteProperty(target: Object, propertyKey: PropertyKey): boolean;
  get(target: Object, propertyKey: PropertyKey, receiver?: any): any;
  getOwnPropertyDescriptor(target: Object, propertyKey: PropertyKey): PropertyDescriptor | void;
  getPrototypeOf(target: Object): Object | null;
  has(target: Object, propertyKey: PropertyKey): boolean;
  isExtensible(target: Object): boolean;
  ownKeys(target: Object): Array<string | symbol>;
  preventExtensions(target: Object): boolean;
  set(target: Object, propertyKey: PropertyKey, V: any, receiver?: any): boolean;
  setPrototypeOf(target: Object, proto: Object | null): boolean; // required __proto__ - IE11+
}
```
[*CommonJS entry points:*](#commonjs)
```
core-js(-pure)/es/reflect
core-js(-pure)/fn/reflect
core-js(-pure)/fn/reflect/apply
core-js(-pure)/fn/reflect/construct
core-js(-pure)/fn/reflect/define-property
core-js(-pure)/fn/reflect/delete-property
core-js(-pure)/fn/reflect/get
core-js(-pure)/fn/reflect/get-own-property-descriptor
core-js(-pure)/fn/reflect/get-prototype-of
core-js(-pure)/fn/reflect/has
core-js(-pure)/fn/reflect/is-extensible
core-js(-pure)/fn/reflect/own-keys
core-js(-pure)/fn/reflect/prevent-extensions
core-js(-pure)/fn/reflect/set
core-js(-pure)/fn/reflect/set-prototype-of
```
[*Examples*](http://goo.gl/gVT0cH):
```js
let object = { a: 1 };
Object.defineProperty(object, 'b', { value: 2 });
object[Symbol('c')] = 3;
Reflect.ownKeys(object); // => ['a', 'b', Symbol(c)]

function C(a, b) {
  this.c = a + b;
}

let instance = Reflect.construct(C, [20, 22]);
instance.c; // => 42
```

### ECMAScript proposals
[The TC39 process.](https://tc39.github.io/process-document/)
`core-js/stage/4` entry point contains only stage 4 proposals, `core-js/stage/3` - stage 3 and stage 4, etc.
#### Stage 4 proposals

[*CommonJS entry points:*](#commonjs)
```js
core-js(-pure)/stage/4
```
None.

#### Stage 3 proposals
[*CommonJS entry points:*](#commonjs)
```js
core-js(-pure)/stage/3
```
* `Array#flatten` and `Array#flatMap` [proposal](https://tc39.github.io/proposal-flatMap) - modules [`esnext.array.flatten`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.array.flatten.js) and [`esnext.array.flat-map`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.array.flat-map.js)
```js
class Array {
  flatten(depthArg?: number = 1): Array<mixed>;
  flatMap(mapFn: (value: any, index: number, target: any) => any, thisArg: any): Array<mixed>;
}
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(-pure)/fn/array/flatten
core-js(-pure)/fn/array/flat-map
core-js(-pure)/fn/array/virtual/flatten
core-js(-pure)/fn/array/virtual/flat-map
```
[*Examples*](https://goo.gl/jTXsZi):
```js
[1, [2, 3], [4, 5]].flatten();    // => [1, 2, 3, 4, 5]
[1, [2, [3, [4]]], 5].flatten();  // => [1, 2, [3, [4]], 5]
[1, [2, [3, [4]]], 5].flatten(3); // => [1, 2, 3, 4, 5]

[{ a: 1, b: 2 }, { a: 3, b: 4 }, { a: 5, b: 6 }].flatMap(it => [it.a, it.b]); // => [1, 2, 3, 4, 5, 6]
```
* `global` [proposal](https://github.com/tc39/proposal-global) - module [`esnext.global`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.global.js). **Warning! Due to [web compatibility concerns](https://github.com/tc39/proposal-global/issues/20), this object will be added to the spec under a different name.**
```js
let global: Object;
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(-pure)/fn/global
```
[*Examples*](http://goo.gl/gEqMl7):
```js
global.Array === Array; // => true
```
* `Promise#finally` [proposal](https://github.com/tc39/proposal-promise-finally) - module [`esnext.promise.finally`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.promise.finally.js)
```js
class Promise {
  finally(onFinally: Function): promise;
}
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(-pure)/fn/promise/finally
```
[*Examples*](https://goo.gl/AhyBbJ):
```js
Promise.resolve(42).finally(() => console.log('You will see it anyway'));

Promise.reject(42).finally(() => console.log('You will see it anyway'));
```
* `Symbol.asyncIterator` for [async iteration proposal](https://github.com/tc39/proposal-async-iteration) - module [`esnext.symbol.async-iterator`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.symbol.async-iterator.js)
```js
class Symbol {
  static asyncIterator: @@asyncIterator;
}
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(-pure)/fn/symbol/async-iterator
```

#### Stage 2 proposals
[*CommonJS entry points:*](#commonjs)
```js
core-js(-pure)/stage/2
```
* `String#trimLeft`, `String#trimRight` / `String#trimStart`, `String#trimEnd` [proposal](https://github.com/tc39/ecmascript-string-left-right-trim) - modules [`esnext.string.trim-left`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.string.trim-right.js), [`esnext.string.trim-right`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.string.trim-right.js)
```js
class String {
  trimLeft(): string;
  trimRight(): string;
  trimStart(): string;
  trimEnd(): string;
}
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(-pure)/fn/string/trim-start
core-js(-pure)/fn/string/trim-end
core-js(-pure)/fn/string/trim-left
core-js(-pure)/fn/string/trim-right
core-js(-pure)/fn/string/virtual/trim-start
core-js(-pure)/fn/string/virtual/trim-end
core-js(-pure)/fn/string/virtual/trim-left
core-js(-pure)/fn/string/virtual/trim-right
```
[*Examples*](http://goo.gl/Er5lMJ):
```js
'   hello   '.trimLeft();  // => 'hello   '
'   hello   '.trimRight(); // => '   hello'
```

#### Stage 1 proposals
[*CommonJS entry points:*](#commonjs)
```js
core-js(-pure)/stage/1
```
* `Symbol#description` [proposal](https://tc39.github.io/proposal-Symbol-description/) - module [`esnext.symbol.description`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.symbol.description.js)
```js
class Symbol {
  get description: string | void;
}
```
[*CommonJS entry points:*](#commonjs)
```js
core-js/fn/symbol/description
```
[*Examples*](https://goo.gl/MWizfc):
```js
Symbol('foo').description; // => 'foo'
Symbol().description;      // => undefined
```
* `String#replaceAll` [proposal](https://github.com/psmarshall/string-replace-all-proposal) - module [`esnext.string.replace-all`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.string.replace-all.js)
```js
class String {
  replaceAll(searchString: string, replaceString: string): string;
}
```
[*CommonJS entry points:*](#commonjs)
```js
core-js/fn/string/replace-all
```
[*Examples*](https://goo.gl/wUXNXN):
```js
'Test abc test test abc test.'.replaceAll('abc', 'foo'); // -> 'Test foo test test foo test.'
```
* `Promise.try` [proposal](https://github.com/tc39/proposal-promise-try) - module [`esnext.promise.try`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.promise.try.js)
```js
class Promise {
  static try(callbackfn: Function): promise;
}
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(-pure)/fn/promise/try
```
[*Examples*](https://goo.gl/k5GGRo):
```js
Promise.try(() => 42).then(it => console.log(`Promise, resolved as ${it}`));

Promise.try(() => { throw 42; }).catch(it => console.log(`Promise, rejected as ${it}`));
```
* `.of` and `.from` methods on collection constructors [proposal](https://github.com/tc39/proposal-setmap-offrom) - modules [`esnext.set.of`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.set.of.js), [`esnext.set.from`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.set.from.js), [`esnext.map.of`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.map.of.js), [`esnext.map.from`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.map.from.js), [`esnext.weak-set.of`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.weak-set.of.js), [`esnext.weak-set.from`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.weak-set.from.js), [`esnext.weak-map.of`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.weak-map.of.js), [`esnext.weak-map.from`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.weak-map.from.js)
```js
class Set {
  static of(...args: Array<mixed>): Set;
  static from(iterable: Iterable<mixed>, mapFn?: (value: any, index: number) => any, thisArg?: any): Set;
}

class Map {
  static of(...args: Array<[key, value]>): Map;
  static from(iterable: Iterable<mixed>, mapFn?: (value: any, index: number) => [key: any, value: any], thisArg?: any): Map;
}

class WeakSet {
  static of(...args: Array<mixed>): WeakSet;
  static from(iterable: Iterable<mixed>, mapFn?: (value: any, index: number) => Object, thisArg?: any): WeakSet;
}

class WeakMap {
  static of(...args: Array<[key, value]>): WeakMap;
  static from(iterable: Iterable<mixed>, mapFn?: (value: any, index: number) => [key: Object, value: any], thisArg?: any): WeakMap;
}
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(-pure)/fn/set/of
core-js(-pure)/fn/set/from
core-js(-pure)/fn/map/of
core-js(-pure)/fn/map/from
core-js(-pure)/fn/weak-set/of
core-js(-pure)/fn/weak-set/from
core-js(-pure)/fn/weak-map/of
core-js(-pure)/fn/weak-map/from
```
[*Examples*](https://goo.gl/mSC7eU):
```js
Set.of(1, 2, 3, 2, 1); // => Set {1, 2, 3}

Map.from([[1, 2], [3, 4]], ([key, value]) => [key ** 2, value ** 2]); // => Map {1: 4, 9: 16}
```
* `String#matchAll` [proposal](https://tc39.github.io/proposal-string-matchall/) - module [`esnext.string.match-all`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.string.match-all.js)
```js
class String {
  matchAll(regexp: RegExp): Iterator;
}
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(-pure)/fn/string/match-all
core-js(-pure)/fn/string/virtual/match-all
```
[*Examples*](https://goo.gl/AxSqHT):
```js
for (let [_, d, D] of '1111a2b3cccc'.matchAll(/(\d)(\D)/g)) {
  console.log(d, D); // => 1 a, 2 b, 3 c
}
```
* `Observable` [proposal](https://github.com/zenparsing/es-observable) - modules [`esnext.observable`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.observable.js) and [`esnext.symbol.observable`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.symbol.observable.js)
```js
class Observable {
  constructor(subscriber: Function): Observable;
  subscribe(observer: Function | { next?: Function, error?: Function, complete?: Function }): Subscription;
  @@observable(): this;
  static of(...items: Aray<mixed>): Observable;
  static from(x: Observable | Iterable): Observable;
  static get @@species: this;
}

class Symbol {
  static observable: @@observable;
}
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(-pure)/fn/observable
core-js(-pure)/fn/symbol/observable
```
[*Examples*](http://goo.gl/1LDywi):
```js
new Observable(observer => {
  observer.next('hello');
  observer.next('world');
  observer.complete();
}).subscribe({
  next(it) { console.log(it); },
  complete() { console.log('!'); }
});
```
* `Math.{clamp, DEG_PER_RAD, degrees, fscale, rad-per-deg, radians, scale}` 
  [proposal](https://github.com/rwaldron/proposal-math-extensions) - modules 
  [`esnext.math.clamp`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.math.clamp.js), 
  [`esnext.math.DEG_PER_RAD`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.math.DEG_PER_RAD.js), 
  [`esnext.math.degrees`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.math.degrees.js),
  [`esnext.math.fscale`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.math.fscale.js), 
  [`esnext.math.RAD_PER_DEG`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.math.RAD_PER_DEG.js), 
  [`esnext.math.radians`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.math.radians.js) and
  [`esnext.math.scale`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.math.scale.js)
```js
namespace Math {
  DEG_PER_RAD: number;
  RAD_PER_DEG: number;
  clamp(x: number, lower: number, upper: number): number;
  degrees(radians: number): number;
  fscale(x: number, inLow: number, inHigh: number, outLow: number, outHigh: number): number;
  radians(degrees: number): number;
  scale(x: number, inLow: number, inHigh: number, outLow: number, outHigh: number): number;
}
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(-pure)/fn/math/clamp
core-js(-pure)/fn/math/deg-per-rad
core-js(-pure)/fn/math/degrees
core-js(-pure)/fn/math/fscale
core-js(-pure)/fn/math/rad-per-deg
core-js(-pure)/fn/math/radians
core-js(-pure)/fn/math/scale
```
* `Math.signbit` [proposal](http://jfbastien.github.io/papers/Math.signbit.html) - module [`esnext.math.signbit`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.math.signbit.js)
```js
namespace Math {
  signbit(x: number): boolean;
}
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(-pure)/fn/math/signbit
```
[*Examples*](http://es.zloirock.ru/):
```js
Math.signbit(NaN); // => NaN
Math.signbit(1);   // => true
Math.signbit(-1);  // => false
Math.signbit(0);   // => true
Math.signbit(-0);  // => false
```

#### Stage 0 proposals
[*CommonJS entry points:*](#commonjs)
```js
core-js(-pure)/stage/0
```
* `String#at` [proposal](https://github.com/mathiasbynens/String.prototype.at) - module [`esnext.string.at`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.string.at.js)
```js
class String {
  at(index: number): string;
}
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(-pure)/fn/string/at
core-js(-pure)/fn/string/virtual/at
```
[*Examples*](http://goo.gl/XluXI8):
```js
'a𠮷b'.at(1);        // => '𠮷'
'a𠮷b'.at(1).length; // => 2
```
* `Math.{iaddh, isubh, imulh, umulh}` [proposal](https://gist.github.com/BrendanEich/4294d5c212a6d2254703) - modules [`esnext.math.iaddh`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.math.iaddh.js), [`esnext.math.isubh`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.math.isubh.js), [`esnext.math.imulh`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.math.imulh.js) and [`esnext.math.umulh`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.math.umulh.js)
```js
namespace Math {
  iaddh(lo0: number, hi0: number, lo1: number, hi1: number): number;
  isubh(lo0: number, hi0: number, lo1: number, hi1: number): number;
  imulh(a: number, b: number): number;
  umulh(a: number, b: number): number;
}
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(-pure)/fn/math/iaddh
core-js(-pure)/fn/math/isubh
core-js(-pure)/fn/math/imulh
core-js(-pure)/fn/math/umulh
```
* `global.asap`, [TC39 discussion](https://github.com/rwaldron/tc39-notes/blob/master/es/2014-09/sept-25.md#510-globalasap-for-enqueuing-a-microtask), module [`esnext.asap`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.asap.js)
```js
function asap(fn: Function): void;
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(-pure)/fn/asap
```
[*Examples*](http://goo.gl/tx3SRK):
```js
asap(() => console.log('called as microtask'));
```

#### Pre-stage 0 proposals
[*CommonJS entry points:*](#commonjs)
```js
core-js(-pure)/stage/pre
```
* `Reflect` metadata [proposal](https://rbuckton.github.io/reflect-metadata/) - modules [`esnext.reflect.define-metadata`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.reflect.define-metadata.js), [`esnext.reflect.delete-metadata`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.reflect.delete-metadata.js), [`esnext.reflect.get-metadata`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.reflect.get-metadata.js), [`esnext.reflect.get-metadata-keys`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.reflect.get-metadata-keys.js), [`esnext.reflect.get-own-metadata`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.reflect.get-own-metadata.js), [`esnext.reflect.get-own-metadata-keys`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.reflect.get-own-metadata-keys.js), [`esnext.reflect.has-metadata`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.reflect.has-metadata.js), [`esnext.reflect.has-own-metadata`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.reflect.has-own-metadata.js) and [`esnext.reflect.metadata`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/esnext.reflect.metadata.js).
```js
namespace Reflect {
  defineMetadata(metadataKey: any, metadataValue: any, target: Object, propertyKey?: PropertyKey): void;
  getMetadata(metadataKey: any, target: Object, propertyKey?: PropertyKey): any;
  getOwnMetadata(metadataKey: any, target: Object, propertyKey?: PropertyKey): any;
  hasMetadata(metadataKey: any, target: Object, propertyKey?: PropertyKey): boolean;
  hasOwnMetadata(metadataKey: any, target: Object, propertyKey?: PropertyKey): boolean;
  deleteMetadata(metadataKey: any, target: Object, propertyKey?: PropertyKey): boolean;
  getMetadataKeys(target: Object, propertyKey?: PropertyKey): Array<mixed>;
  getOwnMetadataKeys(target: Object, propertyKey?: PropertyKey): Array<mixed>;
  metadata(metadataKey: any, metadataValue: any): decorator(target: Object, targetKey?: PropertyKey) => void;
}
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(-pure)/fn/reflect/define-metadata
core-js(-pure)/fn/reflect/delete-metadata
core-js(-pure)/fn/reflect/get-metadata
core-js(-pure)/fn/reflect/get-metadata-keys
core-js(-pure)/fn/reflect/get-own-metadata
core-js(-pure)/fn/reflect/get-own-metadata-keys
core-js(-pure)/fn/reflect/has-metadata
core-js(-pure)/fn/reflect/has-own-metadata
core-js(-pure)/fn/reflect/metadata
```
[*Examples*](http://goo.gl/KCo3PS):
```js
let object = {};
Reflect.defineMetadata('foo', 'bar', object);
Reflect.ownKeys(object);               // => []
Reflect.getOwnMetadataKeys(object);    // => ['foo']
Reflect.getOwnMetadata('foo', object); // => 'bar'
```

### Web standards
[*CommonJS entry points:*](#commonjs)
```js
core-js(-pure)/web
```
#### setTimeout / setInterval
Module [`web.timers`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/web.timers.js). Additional arguments fix for IE9-.
```js
function setTimeout(callback: any, time: any, ...args: Array<mixed>): number;
function setInterval(callback: any, time: any, ...args: Array<mixed>): number;
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(-pure)/web/timers
core-js(-pure)/fn/set-timeout
core-js(-pure)/fn/set-interval
```
```js
// Before:
setTimeout(log.bind(null, 42), 1000);
// After:
setTimeout(log, 1000, 42);
```
#### setImmediate
Module [`web.immediate`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/web.immediate.js). [`setImmediate` proposal](https://developer.mozilla.org/en-US/docs/Web/API/Window.setImmediate) polyfill.
```js
function setImmediate(callback: any, ...args: Array<mixed>): number;
function clearImmediate(id: number): void;
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(-pure)/web/immediate
core-js(-pure)/fn/set-immediate
core-js(-pure)/fn/clear-immediate
```
[*Examples*](http://goo.gl/6nXGrx):
```js
setImmediate((arg1, arg2) => {
  console.log(arg1, arg2); // => Message will be displayed with minimum delay
}, 'Message will be displayed', 'with minimum delay');

clearImmediate(setImmediate(() => {
  console.log('Message will not be displayed');
}));
```
#### Iterable DOM collections
Some DOM collections should have [iterable interface](https://heycam.github.io/webidl/#idl-iterable) or should be [inherited from `Array`](https://heycam.github.io/webidl/#LegacyArrayClass). That mean they should have `forEach`, `keys`, `values`, `entries` and `@@iterator` methods for iteration. So add them. Modules [`web.dom-collections.iterator`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/web.dom-collections.iterator.js) and [`web.dom-collections.for-each`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/web.dom-collections.for-each.js).
```js
class [
  CSSRuleList,
  CSSStyleDeclaration,
  CSSValueList,
  ClientRectList,
  DOMRectList,
  DOMStringList,
  DataTransferItemList,
  FileList,
  HTMLAllCollection,
  HTMLCollection,
  HTMLFormElement,
  HTMLSelectElement,
  MediaList,
  MimeTypeArray,
  NamedNodeMap,
  PaintRequestList,
  Plugin,
  PluginArray,
  SVGLengthList,
  SVGNumberList,
  SVGPathSegList,
  SVGPointList,
  SVGStringList,
  SVGTransformList,
  SourceBufferList,
  StyleSheetList,
  TextTrackCueList,
  TextTrackList,
  TouchList,
] {
  @@iterator(): Iterator<value>;
}

class [DOMTokenList, NodeList] {
  entries(): Iterator<[key, value]>;
  forEach(callbackfn: (value: any, index: number, target: any) => void, thisArg: any): void;
  keys(): Iterator<key>;
  values(): Iterator<value>;
  @@iterator(): Iterator<value>;
}
```
[*CommonJS entry points:*](#commonjs)
```js
core-js(-pure)/web/dom-collections
core-js(-pure)/fn/dom-collections/iterator
core-js/fn/dom-collections/for-each
```
[*Examples*](http://goo.gl/lfXVFl):
```js
for (let { id } of document.querySelectorAll('*')) {
  if (id) console.log(id);
}

for (let [index, { id }] of document.querySelectorAll('*').entries()) {
  if (id) console.log(index, id);
}

document.querySelectorAll('*').forEach(it => console.log(it.id));
```
### Iteration helpers
Modules [`core.is-iterable`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/core.is-iterable.js), [`core.get-iterator`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/core.get-iterator.js), [`core.get-iterator-method`](https://github.com/zloirock/core-js/blob/v3/packages/core-js/modules/core.get-iterator-method.js) - helpers for check iterability / get iterator in the `pure` version or, for example, for `arguments` object:
```js
function isIterable(value: any): boolean;
function getIterator(value: any): Object;
function getIteratorMethod(value: any): Function | void;
```
[*CommonJS entry points:*](#commonjs)
```js
core-js-pure/fn/is-iterable
core-js-pure/fn/get-iterator
core-js-pure/fn/get-iterator-method
```
[*Examples*](http://goo.gl/SXsM6D):
```js
import isIterable from 'core-js-pure/fn/is-iterable';
import getIterator from 'core-js-pure/fn/get-iterator';
import getIteratorMethod from 'core-js-pure/fn/get-iterator-method';

let list = (function () {
  return arguments;
})(1, 2, 3);

console.log(isIterable(list)); // true;

let iterator = getIterator(list);
console.log(iterator.next().value); // 1
console.log(iterator.next().value); // 2
console.log(iterator.next().value); // 3
console.log(iterator.next().value); // undefined

getIterator({});   // TypeError: [object Object] is not iterable!

let method = getIteratorMethod(list);
console.log(typeof method);         // 'function'
let iterator = method.call(list);
console.log(iterator.next().value); // 1
console.log(iterator.next().value); // 2
console.log(iterator.next().value); // 3
console.log(iterator.next().value); // undefined

console.log(getIteratorMethod({})); // undefined
```

## Missing polyfills
- ES `JSON` is missing now only in IE7- and never will it be added to `core-js`, if you need it in these old browsers, many implementations are available, for example, [json3](https://github.com/bestiejs/json3).
- ES `String#normalize` is not a very useful feature, but this polyfill will be very large. If you need it, you can use [unorm](https://github.com/walling/unorm/).
- ES `Proxy` can't be polyfilled, but for Node.js / Chromium with additional flags you can try [harmony-reflect](https://github.com/tvcutsem/harmony-reflect) for adapt old style `Proxy` API to final ES2015 version.
- ES logic for `@@isConcatSpreadable` and `@@species` (in most places) can be polyfilled without problems, but it will cause a serious slowdown in popular cases in some engines. It will be polyfilled when it will be implemented in modern engines.
- `window.fetch` is not a cross-platform feature, in some environments it makes no sense. For this reason, I don't think it should be in `core-js`. Looking at a large number of requests it *may be*  added in the future. Now you can use, for example, [this polyfill](https://github.com/github/fetch).
- ECMA-402 `Intl` is missed because of size. You can use [this polyfill](https://github.com/andyearnshaw/Intl.js/).
