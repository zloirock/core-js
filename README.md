![logo](https://user-images.githubusercontent.com/2213682/146607186-8e13ddef-26a4-4ebf-befd-5aac9d77c090.png)

<div align="center">

[![Open Collective](https://opencollective.com/core-js/all/badge.svg?label=open%20collective)](https://opencollective.com/core-js) [![version](https://img.shields.io/npm/v/core-js.svg)](https://www.npmjs.com/package/core-js) [![core-js downloads](https://img.shields.io/npm/dm/core-js.svg?label=npm%20i%20core-js)](https://npm-stat.com/charts.html?package=core-js&package=core-js-pure&package=core-js-compat&from=2014-11-18) [![core-js-pure downloads](https://img.shields.io/npm/dm/core-js-pure.svg?label=npm%20i%20core-js-pure)](https://npm-stat.com/charts.html?package=core-js&package=core-js-pure&package=core-js-compat&from=2014-11-18) [![jsDelivr](https://data.jsdelivr.com/v1/package/npm/core-js-bundle/badge?style=rounded)](https://www.jsdelivr.com/package/npm/core-js-bundle) [![tests](https://github.com/zloirock/core-js/workflows/tests/badge.svg)](https://github.com/zloirock/core-js/actions) [![eslint](https://github.com/zloirock/core-js/workflows/eslint/badge.svg)](https://github.com/zloirock/core-js/actions)

</div>

> Modular standard library for JavaScript. Includes polyfills for [ECMAScript up to 2021](#ecmascript): [promises](#ecmascript-promise), [symbols](#ecmascript-symbol), [collections](#ecmascript-collections), iterators, [typed arrays](#ecmascript-typed-arrays), many other features, [ECMAScript proposals](#ecmascript-proposals), [some cross-platform WHATWG / W3C features and proposals](#web-standards) like [`URL`](#url-and-urlsearchparams). You can load only required features or use it without global namespace pollution.

**If you're looking documentation for obsolete `core-js@2`, please, check [this branch](https://github.com/zloirock/core-js/tree/v2).**

## As advertising: the author is looking for a good job -)

## [core-js@3, babel and a look into the future](https://github.com/zloirock/core-js/tree/master/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md)

## Raising funds

`core-js` isn't backed by a company, so the future of this project depends on you. Become a sponsor or a backer if you are interested in `core-js`: [**Open Collective**](https://opencollective.com/core-js), [**Patreon**](https://patreon.com/zloirock), **Bitcoin ( bc1qlea7544qtsmj2rayg0lthvza9fau63ux0fstcz )**.

---

<a href="https://opencollective.com/core-js/sponsor/0/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/0/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/1/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/1/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/2/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/2/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/3/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/3/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/4/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/4/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/5/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/5/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/6/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/6/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/7/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/7/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/8/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/8/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/9/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/9/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/10/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/10/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/11/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/11/avatar.svg"></a>

---

<a href="https://opencollective.com/core-js#backers" target="_blank"><img src="https://opencollective.com/core-js/backers.svg?width=890"></a>

---

[*Example of usage*](https://tinyurl.com/2aj9lkwf):
```js
import 'core-js/actual'; // <- at the top of your entry point

Array.from(new Set([1, 2, 3, 2, 1]));          // => [1, 2, 3]
[1, 2, 3, 4, 5].group(it => it % 2);           // => { 1: [1, 3, 5], 0: [2, 4] }
Promise.resolve(42).then(x => console.log(x)); // => 42
structuredClone(new Set([1, 2, 3]));           // => new Set([1, 2, 3])
queueMicrotask(() => console.log('called as microtask'));
```

*You can load only required features*:
```js
import 'core-js/actual/array/from';       // <- at the top of your entry point
import 'core-js/actual/array/group';      // <- at the top of your entry point
import 'core-js/actual/set';              // <- at the top of your entry point
import 'core-js/actual/promise';          // <- at the top of your entry point
import 'core-js/actual/structured-clone'; // <- at the top of your entry point
import 'core-js/actual/queue-microtask';  // <- at the top of your entry point

Array.from(new Set([1, 2, 3, 2, 1]));          // => [1, 2, 3]
[1, 2, 3, 4, 5].group(it => it % 2);           // => { 1: [1, 3, 5], 0: [2, 4] }
Promise.resolve(42).then(x => console.log(x)); // => 42
structuredClone(new Set([1, 2, 3]));           // => new Set([1, 2, 3])
queueMicrotask(() => console.log('called as microtask'));
```

*Or use it without global namespace pollution*:
```js
import from from 'core-js-pure/actual/array/from';
import group from 'core-js-pure/actual/array/group';
import Set from 'core-js-pure/actual/set';
import Promise from 'core-js-pure/actual/promise';
import structuredClone from 'core-js-pure/actual/structured-clone';
import queueMicrotask from 'core-js-pure/actual/queue-microtask';

from(new Set([1, 2, 3, 2, 1]));                // => [1, 2, 3]
group([1, 2, 3, 4, 5], it => it % 2);          // => { 1: [1, 3, 5], 0: [2, 4] }
Promise.resolve(42).then(x => console.log(x)); // => 42
structuredClone(new Set([1, 2, 3]));           // => new Set([1, 2, 3])
queueMicrotask(() => console.log('called as microtask'));
```

### Index
- [Usage](#usage)
  - [Installation](#installation)
  - [`postinstall` message](#postinstall-message)
  - [CommonJS API](#commonjs-api)
  - [Babel](#babel)
  - [swc](#swc)
  - [Configurable level of aggressiveness](#configurable-level-of-aggressiveness)
  - [Custom build](#custom-build)
- [Compatibility data](#compatibility-data)
- [Supported engines](#supported-engines)
- [Features](#features)
  - [ECMAScript](#ecmascript)
    - [ECMAScript: Object](#ecmascript-object)
    - [ECMAScript: Function](#ecmascript-function)
    - [ECMAScript: Error](#ecmascript-error)
    - [ECMAScript: Array](#ecmascript-array)
    - [ECMAScript: String and RegExp](#ecmascript-string-and-regexp)
    - [ECMAScript: Number](#ecmascript-number)
    - [ECMAScript: Math](#ecmascript-math)
    - [ECMAScript: Date](#ecmascript-date)
    - [ECMAScript: Promise](#ecmascript-promise)
    - [ECMAScript: Symbol](#ecmascript-symbol)
    - [ECMAScript: Collections](#ecmascript-collections)
    - [ECMAScript: Typed Arrays](#ecmascript-typed-arrays)
    - [ECMAScript: Reflect](#ecmascript-reflect)
    - [ECMAScript: JSON](#ecmascript-json)
    - [ECMAScript: globalThis](#ecmascript-globalthis)
  - [ECMAScript proposals](#ecmascript-proposals)
    - [Finished proposals](#finished-proposals)
      - [`globalThis`](#globalthis)
      - [Relative indexing method](#relative-indexing-method)
      - [`Array.prototype.includes`](#arrayprototypeincludes)
      - [`Array.prototype.flat` / `Array.prototype.flatMap`](#arrayprototypeflat--arrayprototypeflatmap)
      - [`Array` find from last](#array-find-from-last)
      - [`Object.values` / `Object.entries`](#objectvalues--objectentries)
      - [`Object.fromEntries`](#objectfromentries)
      - [`Object.getOwnPropertyDescriptors`](#objectgetownpropertydescriptors)
      - [Accessible `Object.prototype.hasOwnProperty`](#accessible-objectprototypehasownproperty)
      - [`String` padding](#string-padding)
      - [`String.prototype.matchAll`](#stringmatchall)
      - [`String.prototype.replaceAll`](#stringreplaceall)
      - [`String.prototype.trimStart` / `String.prototype.trimEnd`](#stringprototypetrimstart-stringprototypetrimend)
      - [`RegExp` `s` (`dotAll`) flag](#regexp-s-dotall-flag)
      - [`RegExp` named capture groups](#regexp-named-capture-groups)
      - [`Promise.allSettled`](#promiseallsettled)
      - [`Promise.any`](#promiseany)
      - [`Promise.prototype.finally`](#promiseprototypefinally)
      - [`Symbol.asyncIterator` for asynchronous iteration](#symbolasynciterator-for-asynchronous-iteration)
      - [`Symbol.prototype.description`](#symbolprototypedescription)
      - [Well-formed `JSON.stringify`](#well-formed-jsonstringify)
    - [Stage 3 proposals](#stage-3-proposals)
      - [`Array` grouping](#array-grouping)
      - [Change `Array` by copy](#change-array-by-copy)
    - [Stage 2 proposals](#stage-2-proposals)
      - [`Iterator` helpers](#iterator-helpers)
      - [New `Set` methods](#new-set-methods)
      - [`Map.prototype.emplace`](#mapprototypeemplace)
      - [`Array.fromAsync`](#arrayfromasync)
      - [`Array.isTemplateObject`](#arrayistemplateobject)
      - [`Symbol.{ asyncDispose, dispose }` for `using` statement](#symbol-asyncdispose-dispose--for-using-statement)
      - [`Symbol.metadataKey` for decorators metadata proposal](#symbolmetadatakey-for-decorators-metadata-proposal)
    - [Stage 1 proposals](#stage-1-proposals)
      - [`Observable`](#observable)
      - [New collections methods](#new-collections-methods)
      - [`.of` and `.from` methods on collection constructors](#of-and-from-methods-on-collection-constructors)
      - [`compositeKey` and `compositeSymbol`](#compositekey-and-compositesymbol)
      - [`Array` filtering](#array-filtering)
      - [`Array` deduplication](#array-deduplication)
      - [Getting last item from `Array`](#getting-last-item-from-array)
      - [`Number.range`](#numberrange)
      - [`Number.fromString`](#numberfromstring)
      - [`Math` extensions](#math-extensions)
      - [`Math.signbit`](#mathsignbit)
      - [`String.cooked`](#stringcooked)
      - [`String.prototype.codePoints`](#stringprototypecodepoints)
      - [`Symbol.matcher` for pattern matching](#symbolmatcher-for-pattern-matching)
    - [Stage 0 proposals](#stage-0-proposals)
      - [`Function.prototype.unThis`](#functionprototypeunthis)
      - [`Function.{ isCallable, isConstructor }`](#function-iscallable-isconstructor-)
      - [`URL`](#url)
    - [Pre-stage 0 proposals](#pre-stage-0-proposals)
      - [`Reflect` metadata](#reflect-metadata)
  - [Web standards](#web-standards)
  - [Iteration helpers](#iteration-helpers)
- [Missing polyfills](#missing-polyfills)
- [Contributing](./CONTRIBUTING.md)
- [Security policy](https://github.com/zloirock/core-js/blob/master/SECURITY.md)
- [Changelog](./CHANGELOG.md)

## [Usage](docs/Usage.md)[⬆](#index)

### [Installation:](docs/Usage.md#installation)
### [`postinstall` message](docs/Usage.md#postinstall-message)
### [CommonJS API](docs/Usage.md#commonjs-api)
### [Babel](docs/Usage.md#babel)
### [swc](docs/Usage.md#swc)
### [Configurable level of aggressiveness](docs/Usage.md#configurable-level-of-aggressiveness)
### [Custom build](docs/Usage.md#custom-build)

## [Compatibility data](docs/Compatibility%20data.md)[⬆](#index)

## [Supported engines](docs/Supported%20engines.md)[⬆](#index)

## Features:[⬆](#index)
[*CommonJS entry points:*](docs/Usage.md#commonjs-api)
```
core-js(-pure)
```

### ECMAScript[⬆](#index)
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es
```
#### [ECMAScript: Object](docs/Features/ECMAScript/Object.md)

#### [ECMAScript: Function](docs/Features/ECMAScript/Function.md)

#### [ECMAScript: Error](docs/Features/ECMAScript/Error.md)

#### [ECMAScript: Array](docs/Features/ECMAScript/Array.md)

#### [ECMAScript: String and RegExp](docs/Features/ECMAScript/String%20and%20RegExp.md)

#### [ECMAScript: Number](docs/Features/ECMAScript/Number.md)

#### [ECMAScript: Math](docs/Features/ECMAScript/Math.md)

#### [ECMAScript: Date](docs/Features/ECMAScript/Date.md)

#### [ECMAScript: Promise](docs/Features/ECMAScript/Promise.md)

#### [ECMAScript: Symbol](docs/Features/ECMAScript/Symbol.md)

#### ECMAScript: Collections[⬆](#index)
`core-js` uses native collections in most case, just fixes methods / constructor, if it's required, and in old environment uses fast polyfill (O(1) lookup).
#### Map[⬆](#index)
Module [`es.map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.map.js).
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
  readonly attribute size: number;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/map
```
[*Examples*](https://goo.gl/GWR7NI):
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
#### Set[⬆](#index)
Module [`es.set`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.set.js).
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
  readonly attribute size: number;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/set
```
[*Examples*](https://goo.gl/bmhLwg):
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
#### WeakMap[⬆](#index)
Module [`es.weak-map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.weak-map.js).
```js
class WeakMap {
  constructor(iterable?: Iterable<[key, value]>): WeakMap;
  delete(key: Object): boolean;
  get(key: Object): any;
  has(key: Object): boolean;
  set(key: Object, val: any): this;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/weak-map
```
[*Examples*](https://goo.gl/SILXyw):
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
#### WeakSet[⬆](#index)
Module [`es.weak-set`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.weak-set.js).
```js
class WeakSet {
  constructor(iterable?: Iterable<value>): WeakSet;
  add(key: Object): this;
  delete(key: Object): boolean;
  has(key: Object): boolean;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/weak-set
```
[*Examples*](https://goo.gl/TdFbEx):
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
##### Caveats when using collections polyfill:[⬆](#index)

* Weak-collections polyfill stores values as hidden properties of keys. It works correct and not leak in most cases. However, it is desirable to store a collection longer than its keys.

#### ECMAScript: Typed Arrays[⬆](#index)
Implementations and fixes for `ArrayBuffer`, `DataView`, Typed Arrays constructors, static and prototype methods. Typed arrays work only in environments with support descriptors (IE9+), `ArrayBuffer` and `DataView` should work anywhere.

Modules [`es.array-buffer.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array-buffer.constructor.js), [`es.array-buffer.is-view`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array-buffer.is-view.js), [`es.array-buffer.slice`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array-buffer.slice.js), [`es.data-view`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.data-view.js), [`es.typed-array.int8-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.int8-array.js), [`es.typed-array.uint8-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.uint8-array.js), [`es.typed-array.uint8-clamped-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.uint8-clamped-array.js), [`es.typed-array.int16-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.int16-array.js), [`es.typed-array.uint16-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.uint16-array.js), [`es.typed-array.int32-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed.int32-array.js), [`es.typed-array.uint32-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.uint32-array.js), [`es.typed-array.float32-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.float32-array.js), [`es.typed-array.float64-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.float64-array.js), [`es.typed-array.copy-within`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.copy-within.js), [`es.typed-array.every`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.every.js), [`es.typed-array.fill`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.fill.js), [`es.typed-array.filter`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.filter.js), [`es.typed-array.find`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.find.js), [`es.typed-array.find-index`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.find-index.js), [`es.typed-array.find-last`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.find-last.js), [`es.typed-array.find-last-index`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.find-last-index.js), [`es.typed-array.for-each`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.for-each.js), [`es.typed-array.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.from.js), [`es.typed-array.includes`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.includes.js), [`es.typed-array.index-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.index-of.js), [`es.typed-array.iterator`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.iterator.js), [`es.typed-array.last-index-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.last-index-of.js), [`es.typed-array.map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.map.js), [`es.typed-array.of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.of.js), [`es.typed-array.reduce`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.reduce.js), [`es.typed-array.reduce-right`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.reduce-right.js), [`es.typed-array.reverse`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.reverse.js), [`es.typed-array.set`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.set.js), [`es.typed-array.slice`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.slice.js), [`es.typed-array.some`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.some.js), [`es.typed-array.sort`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.sort.js), [`es.typed-array.subarray`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.subarray.js), [`es.typed-array.to-locale-string`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.to-locale-string.js), [`es.typed-array.to-string`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.to-string.js), [`es.typed-array.at`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.at.js).
```js
class ArrayBuffer {
  constructor(length: any): ArrayBuffer;
  slice(start: any, end: any): ArrayBuffer;
  readonly attribute byteLength: number;
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
  readonly attribute buffer: ArrayBuffer;
  readonly attribute byteLength: number;
  readonly attribute byteOffset: number;
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
] extends %TypedArray% {
  constructor(length: number): %TypedArray%;
  constructor(object: %TypedArray% | Iterable | ArrayLike): %TypedArray%;
  constructor(buffer: ArrayBuffer, byteOffset?: number, length?: number): %TypedArray%
}

class %TypedArray% {
  at(index: int): number;
  copyWithin(target: number, start: number, end?: number): this;
  every(callbackfn: (value: number, index: number, target: %TypedArray%) => boolean, thisArg?: any): boolean;
  fill(value: number, start?: number, end?: number): this;
  filter(callbackfn: (value: number, index: number, target: %TypedArray%) => boolean, thisArg?: any): %TypedArray%;
  find(callbackfn: (value: number, index: number, target: %TypedArray%) => boolean), thisArg?: any): any;
  findIndex(callbackfn: (value: number, index: number, target: %TypedArray%) => boolean, thisArg?: any): uint;
  findLast(callbackfn: (value: any, index: number, target: %TypedArray%) => boolean, thisArg?: any): any;
  findLastIndex(callbackfn: (value: any, index: number, target: %TypedArray%) => boolean, thisArg?: any): uint;
  forEach(callbackfn: (value: number, index: number, target: %TypedArray%) => void, thisArg?: any): void;
  includes(searchElement: any, from?: number): boolean;
  indexOf(searchElement: any, from?: number): number;
  join(separator: string = ','): string;
  lastIndexOf(searchElement: any, from?: number): number;
  map(mapFn: (value: number, index: number, target: %TypedArray%) => number, thisArg?: any): %TypedArray%;
  reduce(callbackfn: (memo: any, value: number, index: number, target: %TypedArray%) => any, initialValue?: any): any;
  reduceRight(callbackfn: (memo: any, value: number, index: number, target: %TypedArray%) => any, initialValue?: any): any;
  reverse(): this;
  set(array: ArrayLike, offset?: number): void;
  slice(start?: number, end?: number): %TypedArray%;
  some(callbackfn: (value: number, index: number, target: %TypedArray%) => boolean, thisArg?: any): boolean;
  sort(comparefn?: (a: number, b: number) => number): this; // with modern behavior like stable sort
  subarray(begin?: number, end?: number): %TypedArray%;
  toString(): string;
  toLocaleString(): string;
  values(): Iterator<value>;
  keys(): Iterator<index>;
  entries(): Iterator<[index, value]>;
  @@iterator(): Iterator<value>;
  readonly attribute buffer: ArrayBuffer;
  readonly attribute byteLength: number;
  readonly attribute byteOffset: number;
  readonly attribute length: number;
  BYTES_PER_ELEMENT: number;
  static from(items: Iterable | ArrayLike, mapFn?: (value: any, index: number) => any, thisArg?: any): %TypedArray%;
  static of(...args: Array<mixed>): %TypedArray%;
  static BYTES_PER_ELEMENT: number;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/es|stable|actual|full/array-buffer
core-js/es|stable|actual|full/array-buffer/constructor
core-js/es|stable|actual|full/array-buffer/is-view
core-js/es|stable|actual|full/array-buffer/slice
core-js/es|stable|actual|full/data-view
core-js/es|stable|actual|full/typed-array
core-js/es|stable|actual|full/typed-array/int8-array
core-js/es|stable|actual|full/typed-array/uint8-array
core-js/es|stable|actual|full/typed-array/uint8-clamped-array
core-js/es|stable|actual|full/typed-array/int16-array
core-js/es|stable|actual|full/typed-array/uint16-array
core-js/es|stable|actual|full/typed-array/int32-array
core-js/es|stable|actual|full/typed-array/uint32-array
core-js/es|stable|actual|full/typed-array/float32-array
core-js/es|stable|actual|full/typed-array/float64-array
core-js/es|stable|actual|full/typed-array/at
core-js/es|stable|actual|full/typed-array/copy-within
core-js/es|stable|actual|full/typed-array/entries
core-js/es|stable|actual|full/typed-array/every
core-js/es|stable|actual|full/typed-array/fill
core-js/es|stable|actual|full/typed-array/filter
core-js/es|stable|actual|full/typed-array/find
core-js/es|stable|actual|full/typed-array/find-index
core-js/es|stable|actual|full/typed-array/find-last
core-js/es|stable|actual|full/typed-array/find-last-index
core-js/es|stable|actual|full/typed-array/for-each
core-js/es|stable|actual|full/typed-array/from
core-js/es|stable|actual|full/typed-array/includes
core-js/es|stable|actual|full/typed-array/index-of
core-js/es|stable|actual|full/typed-array/iterator
core-js/es|stable|actual|full/typed-array/join
core-js/es|stable|actual|full/typed-array/keys
core-js/es|stable|actual|full/typed-array/last-index-of
core-js/es|stable|actual|full/typed-array/map
core-js/es|stable|actual|full/typed-array/of
core-js/es|stable|actual|full/typed-array/reduce
core-js/es|stable|actual|full/typed-array/reduce-right
core-js/es|stable|actual|full/typed-array/reverse
core-js/es|stable|actual|full/typed-array/set
core-js/es|stable|actual|full/typed-array/slice
core-js/es|stable|actual|full/typed-array/some
core-js/es|stable|actual|full/typed-array/sort
core-js/es|stable|actual|full/typed-array/subarray
core-js/es|stable|actual|full/typed-array/to-locale-string
core-js/es|stable|actual|full/typed-array/to-string
core-js/es|stable|actual|full/typed-array/values
```
[*Examples*](https://is.gd/Eo7ltU):
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

new Int32Array([1, 2, 3]).at(1);  // => 2
new Int32Array([1, 2, 3]).at(-1); // => 3
```
##### Caveats when using typed arrays polyfills:[⬆](#index)

* Polyfills of Typed Arrays constructors work completely how should work by the spec, but because of internal usage of getters / setters on each instance, are slow and consumes significant memory. However, polyfills of Typed Arrays constructors required mainly for old IE, all modern engines have native Typed Arrays constructors and require only fixes of constructors and polyfills of methods.

#### ECMAScript: Reflect[⬆](#index)
Modules [`es.reflect.apply`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.apply.js), [`es.reflect.construct`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.construct.js), [`es.reflect.define-property`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.define-property.js), [`es.reflect.delete-property`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.delete-property.js), [`es.reflect.get`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.get.js), [`es.reflect.get-own-property-descriptor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.get-own-property-descriptor.js), [`es.reflect.get-prototype-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.get-prototype-of.js), [`es.reflect.has`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.has.js), [`es.reflect.is-extensible`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.is-extensible.js), [`es.reflect.own-keys`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.own-keys.js), [`es.reflect.prevent-extensions`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.prevent-extensions.js), [`es.reflect.set`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.set.js), [`es.reflect.set-prototype-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.set-prototype-of.js).
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
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/reflect
core-js(-pure)/es|stable|actual|full/reflect/apply
core-js(-pure)/es|stable|actual|full/reflect/construct
core-js(-pure)/es|stable|actual|full/reflect/define-property
core-js(-pure)/es|stable|actual|full/reflect/delete-property
core-js(-pure)/es|stable|actual|full/reflect/get
core-js(-pure)/es|stable|actual|full/reflect/get-own-property-descriptor
core-js(-pure)/es|stable|actual|full/reflect/get-prototype-of
core-js(-pure)/es|stable|actual|full/reflect/has
core-js(-pure)/es|stable|actual|full/reflect/is-extensible
core-js(-pure)/es|stable|actual|full/reflect/own-keys
core-js(-pure)/es|stable|actual|full/reflect/prevent-extensions
core-js(-pure)/es|stable|actual|full/reflect/set
core-js(-pure)/es|stable|actual|full/reflect/set-prototype-of
```
[*Examples*](https://goo.gl/gVT0cH):
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

#### ECMAScript: JSON[⬆](#index)
Since `JSON` object is missed only in very old engines like IE7-, `core-js` does not provide a full `JSON` polyfill, however, fix already existing implementations by the current standard, for example, [well-formed `JSON.stringify`](https://github.com/tc39/proposal-well-formed-stringify). `JSON` also fixed in other modules - for example, `Symbol` polyfill fixes `JSON.stringify` for correct work with symbols.

Module [`es.json.to-string-tag`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.json.to-string-tag.js) and [`es.json.stringify`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.json.stringify.js).
```js
namespace JSON {
  stringify(target: any, replacer?: Function | Array, space?: string | number): string | void;
  @@toStringTag: 'JSON';
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js(-pure)/es|stable|actual|full/json/stringify
core-js(-pure)/es|stable|actual|full/json/to-string-tag
```
[*Examples*](https://is.gd/izZqKn):
```js
JSON.stringify({ '𠮷': ['\uDF06\uD834'] }); // => '{"𠮷":["\\udf06\\ud834"]}'
```

#### ECMAScript: globalThis[⬆](#index)
Module [`es.global-this`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.global-this.js).
```js
let globalThis: Object;
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js(-pure)/es|stable|actual|full/global-this
```
[*Examples*](https://goo.gl/LAifsc):
```js
globalThis.Array === Array; // => true
```

### ECMAScript proposals[⬆](#index)
[The TC39 process.](https://tc39.github.io/process-document/)

#### Finished proposals[⬆](#index)

Finished (stage 4) proposals already marked in `core-js` as stable ECMAScript, they are available in `core-js/stable` and `core-js/es` namespace, you can find then in related sections of this doc. However, even for finished proposals, `core-js` provide a way to include only features for a specific proposal like `core-js/proposals/proposal-name`.

##### [`globalThis`](https://github.com/tc39/proposal-global)[⬆](#index)
```js
let globalThis: Object;
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/global-this
```
##### [Relative indexing method](https://github.com/tc39/proposal-relative-indexing-method)[⬆](#index)
```js
class Array {
  at(index: int): any;
}

class String {
  at(index: int): string;
}

class %TypedArray% {
  at(index: int): number;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/relative-indexing-method
```
##### [`Array.prototype.includes`](https://github.com/tc39/proposal-Array.prototype.includes)[⬆](#index)
```js
class Array {
  includes(searchElement: any, from?: number): boolean;
}

class %TypedArray% {
  includes(searchElement: any, from?: number): boolean;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/array-includes
```
##### [`Array.prototype.flat` / `Array.prototype.flatMap`](https://github.com/tc39/proposal-flatMap)[⬆](#index)
```js
class Array {
  flat(depthArg?: number = 1): Array<mixed>;
  flatMap(mapFn: (value: any, index: number, target: any) => any, thisArg: any): Array<mixed>;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/array-flat-map
```
##### [Array find from last](https://github.com/tc39/proposal-array-find-from-last)[⬆](#index)
```js
class Array {
  findLast(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): any;
  findLastIndex(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): uint;
}

class %TypedArray% {
  findLast(callbackfn: (value: any, index: number, target: %TypedArray%) => boolean, thisArg?: any): any;
  findLastIndex(callbackfn: (value: any, index: number, target: %TypedArray%) => boolean, thisArg?: any): uint;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/array-find-from-last
```
##### [`Object.values` / `Object.entries`](https://github.com/tc39/proposal-object-values-entries)[⬆](#index)
```js
class Object {
  static entries(object: Object): Array<[string, mixed]>;
  static values(object: any): Array<mixed>;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/object-values-entries
```
##### [`Object.fromEntries`](https://github.com/tc39/proposal-object-from-entries)[⬆](#index)
```js
class Object {
  static fromEntries(iterable: Iterable<[key, value]>): Object;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/object-from-entries
```
##### [`Object.getOwnPropertyDescriptors`](https://github.com/tc39/proposal-object-getownpropertydescriptors)[⬆](#index)
```js
class Object {
  static getOwnPropertyDescriptors(object: any): { [property: PropertyKey]: PropertyDescriptor };
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/object-getownpropertydescriptors
```
##### [Accessible `Object.prototype.hasOwnProperty`](https://github.com/tc39/proposal-accessible-object-hasownproperty)[⬆](#index)
```js
class Object {
  static hasOwn(object: object, key: PropertyKey): boolean;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/accessible-object-hasownproperty
```
##### [`String` padding](https://github.com/tc39/proposal-string-pad-start-end)[⬆](#index)
```js
class String {
  padStart(length: number, fillStr?: string = ' '): string;
  padEnd(length: number, fillStr?: string = ' '): string;
}

```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/string-padding
```
##### [`String#matchAll`](https://github.com/tc39/proposal-string-matchall)[⬆](#index).
```js
class String {
  matchAll(regexp: RegExp): Iterator;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/string-match-all
```
##### [`String#replaceAll`](https://github.com/tc39/proposal-string-replace-all)[⬆](#index)
```js
class String {
  replaceAll(searchValue: string | RegExp, replaceString: string | (searchValue, index, this) => string): string;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/string-replace-all-stage-4
```
##### [`String.prototype.trimStart` / `String.prototype.trimEnd`](https://github.com/tc39/proposal-string-left-right-trim)[⬆](#index)
```js
class String {
  trimLeft(): string;
  trimRight(): string;
  trimStart(): string;
  trimEnd(): string;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/string-left-right-trim
```
##### [`RegExp` `s` (`dotAll`) flag](https://github.com/tc39/proposal-regexp-dotall-flag)[⬆](#index)
```js
// patched for support `RegExp` dotAll (`s`) flag:
class RegExp {
  constructor(pattern: RegExp | string, flags?: string): RegExp;
  exec(): Array<string | undefined> | null;
  readonly attribute dotAll: boolean;
  readonly attribute flags: string;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/regexp-dotall-flag
```
##### [`RegExp` named capture groups](https://github.com/tc39/proposal-regexp-named-groups)[⬆](#index)
```js
// patched for support `RegExp` named capture groups:
class RegExp {
  constructor(pattern: RegExp | string, flags?: string): RegExp;
  exec(): Array<string | undefined> | null;
  @@replace(string: string, replaceValue: Function | string): string;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/regexp-named-groups
```
##### [`Promise.allSettled`](https://github.com/tc39/proposal-promise-allSettled)[⬆](#index)
```js
class Promise {
  static allSettled(iterable: Iterable): Promise;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/promise-all-settled
```
##### [`Promise.any`](https://github.com/tc39/proposal-promise-any)[⬆](#index)
```js
class AggregateError {
  constructor(errors: Iterable, message: string): AggregateError;
  errors: Array<any>;
  message: string;
}

class Promise {
  static any(promises: Iterable): Promise<any>;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/promise-any
```
##### [`Promise.prototype.finally`](https://github.com/tc39/proposal-promise-finally)[⬆](#index)
```js
class Promise {
  finally(onFinally: Function): Promise;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/promise-finally
```
##### [`Symbol.asyncIterator` for asynchronous iteration](https://github.com/tc39/proposal-async-iteration)[⬆](#index)
```js
class Symbol {
  static asyncIterator: @@asyncIterator;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/async-iteration
```
##### [`Symbol.prototype.description`](https://github.com/tc39/proposal-Symbol-description)[⬆](#index)
```js
class Symbol {
  readonly attribute description: string | void;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/symbol-description
```
##### [Well-formed `JSON.stringify`](https://github.com/tc39/proposal-well-formed-stringify)[⬆](#index)
```js
namespace JSON {
  stringify(target: any, replacer?: Function | Array, space?: string | number): string | void;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/well-formed-stringify
```

#### Stage 3 proposals[⬆](#index)

`core-js/stage/3` entry point contains only stage 3 proposals, `core-js/stage/2` - stage 2 and stage 3, etc.

[*CommonJS entry points:*](#commonjs-api)
```js
core-js(-pure)/stage/3
```
##### [`Array` grouping](https://github.com/tc39/proposal-array-grouping)[⬆](#index)
Modules [`esnext.array.group`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.group.js), [`esnext.array.group-to-map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.group-to-map.js).
```js
class Array {
  group(callbackfn: (value: any, index: number, target: any) => key, thisArg?: any): { [key]: Array<mixed> };
  groupToMap(callbackfn: (value: any, index: number, target: any) => key, thisArg?: any): Map<key, Array<mixed>>;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/array-grouping-stage-3-2
core-js(-pure)/actual|full/array(/virtual)/group
core-js(-pure)/actual|full/array(/virtual)/group-to-map
```
[*Examples*](https://is.gd/3a0PbH):
```js
[1, 2, 3, 4, 5].group(it => it % 2); // => { 1: [1, 3, 5], 0: [2, 4] }

const map = [1, 2, 3, 4, 5].groupToMap(it => it % 2);
map.get(1); // => [1, 3, 5]
map.get(0); // => [2, 4]
````
##### [Change `Array` by copy](https://github.com/tc39/proposal-change-array-by-copy)[⬆](#index)
Modules [`esnext.array.to-reversed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.to-reversed.js), [`esnext.array.to-sorted`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.to-sorted.js), [`esnext.array.to-spliced`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.to-spliced.js), [`esnext.array.with`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.with.js), [`esnext.typed-array.to-reversed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.typed-array.to-reversed.js), [`esnext.typed-array.to-sorted`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.typed-array.to-sorted.js), [`esnext.typed-array.to-spliced`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.typed-array.to-spliced.js), [`esnext.typed-array.with`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.typed-array.with.js).
```js
class Array {
  toReversed(): Array<mixed>;
  toSpliced(start?: number, deleteCount?: number, ...items: Array<mixed>): Array<mixed>;
  toSorted(comparefn?: (a: any, b: any) => number): Array<mixed>;
  with(index: includes, value: any): Array<mixed>;
}

class %TypedArray% {
  toReversed(): %TypedArray%;
  toSpliced(start?: number, deleteCount?: number, ...items: %TypedArray%): %TypedArray%;
  toSorted(comparefn?: (a: any, b: any) => number): %TypedArray%;
  with(index: includes, value: any): %TypedArray%;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/change-array-by-copy
core-js(-pure)/actual|full/array(/virtual)/to-reversed
core-js(-pure)/actual|full/array(/virtual)/to-sorted
core-js(-pure)/actual|full/array(/virtual)/to-spliced
core-js(-pure)/actual|full/array(/virtual)/with
core-js/actual|full/typed-array/to-reversed
core-js/actual|full/typed-array/to-sorted
core-js/actual|full/typed-array/to-spliced
core-js/actual|full/typed-array/with
```
[*Examples*](https://is.gd/tVkbY3):
```js
const sequence = [1, 2, 3];
sequence.toReversed(); // => [3, 2, 1]
sequence; // => [1, 2, 3]

const array = [1, 2, 3, 4];
array.toSpliced(1, 2, 5, 6, 7); // => [1, 5, 6, 7, 4]
array; // => [1, 2, 3, 4]

const outOfOrder = [3, 1, 2];
outOfOrder.toSorted(); // => [1, 2, 3]
outOfOrder; // => [3, 1, 2]

const correctionNeeded = [1, 1, 3];
correctionNeeded.with(1, 2); // => [1, 2, 3]
correctionNeeded; // => [1, 1, 3]
````

#### Stage 2 proposals[⬆](#index)
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/stage/2
```
##### [Iterator helpers](https://github.com/tc39/proposal-iterator-helpers)[⬆](#index)
Modules [`esnext.async-iterator.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.constructor.js), [`esnext.async-iterator.as-indexed-pairs`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.as-indexed-pairs.js), [`esnext.async-iterator.drop`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.drop.js), [`esnext.async-iterator.every`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.every.js), [`esnext.async-iterator.filter`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.filter.js), [`esnext.async-iterator.find`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.find.js), [`esnext.async-iterator.flat-map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.flat-map.js), [`esnext.async-iterator.for-each`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.for-each.js), [`esnext.async-iterator.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.from.js), [`esnext.async-iterator.map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.map.js), [`esnext.async-iterator.reduce`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.reduce.js), [`esnext.async-iterator.some`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.some.js), [`esnext.async-iterator.take`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.take.js), [`esnext.async-iterator.to-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.to-array.js), [`esnext.iterator.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.constructor.js), [`esnext.iterator.as-indexed-pairs`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.as-indexed-pairs.js), [`esnext.iterator.drop`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.drop.js), [`esnext.iterator.every`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.every.js), [`esnext.iterator.filter`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.filter.js), [`esnext.iterator.find`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.find.js), [`esnext.iterator.flat-map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.flat-map.js), [`esnext.iterator.for-each`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.for-each.js), [`esnext.iterator.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.from.js), [`esnext.iterator.map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.map.js), [`esnext.iterator.reduce`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.reduce.js), [`esnext.iterator.some`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.some.js), [`esnext.iterator.take`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.take.js), [`esnext.iterator.to-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.to-array.js) and [`esnext.iterator.to-async`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.to-async.js)
```js
class Iterator {
  static from(iterable: Iterable<mixed>): Iterator<any>;
  asIndexedPairs(): Iterator<[index, any]>;
  drop(limit: uint): Iterator<any>;
  every(callbackfn: value: any => boolean): boolean;
  filter(callbackfn: value: any => boolean): Iterator<any>;
  find(callbackfn: value: any => boolean)): any;
  flatMap(callbackfn: value => any: Iterable): Iterator<any>;
  forEach(callbackfn: value => void): void;
  map(callbackfn: value => any): Iterator<any>;
  reduce(callbackfn: (memo: any, value: any) => any, initialValue: any): any;
  some(callbackfn: value: any => boolean): boolean;
  take(limit: uint): Iterator<any>;
  toArray(): Array<any>;
  toAsync(): AsyncIterator<any>;
  @@toStringTag: 'Iterator'
}

class AsyncIterator {
  static from(iterable: Iterable<mixed>): AsyncIterator<any>;
  asIndexedPairs(): AsyncIterator<[index, any]>;
  drop(limit: uint): AsyncIterator<any>;
  every(async callbackfn: value: any => boolean): Promise<boolean>;
  filter(async callbackfn: value: any => boolean): AsyncIterator<any>;
  find(async callbackfn: value: any => boolean)): Promise<any>;
  flatMap(async callbackfn: value => any: Iterable): AsyncIterator<any>;
  forEach(async callbackfn: value => void): Promise<void>;
  map(async callbackfn: value => any): AsyncIterator<any>;
  reduce(async callbackfn: (memo: any, value: any) => any, initialValue: any): Promise<any>;
  some(async callbackfn: value: any => boolean): Promise<boolean>;
  take(limit: uint): AsyncIterator<any>;
  toArray(): Promise<Array>;
  @@toStringTag: 'AsyncIterator'
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/iterator-helpers
core-js(-pure)/full/async-iterator
core-js(-pure)/full/async-iterator/as-indexed-pairs
core-js(-pure)/full/async-iterator/drop
core-js(-pure)/full/async-iterator/every
core-js(-pure)/full/async-iterator/filter
core-js(-pure)/full/async-iterator/find
core-js(-pure)/full/async-iterator/flat-map
core-js(-pure)/full/async-iterator/for-each
core-js(-pure)/full/async-iterator/from
core-js(-pure)/full/async-iterator/map
core-js(-pure)/full/async-iterator/reduce
core-js(-pure)/full/async-iterator/some
core-js(-pure)/full/async-iterator/take
core-js(-pure)/full/async-iterator/to-array
core-js(-pure)/full/iterator
core-js(-pure)/full/iterator/as-indexed-pairs
core-js(-pure)/full/iterator/drop
core-js(-pure)/full/iterator/every
core-js(-pure)/full/iterator/filter
core-js(-pure)/full/iterator/find
core-js(-pure)/full/iterator/flat-map
core-js(-pure)/full/iterator/for-each
core-js(-pure)/full/iterator/from
core-js(-pure)/full/iterator/map
core-js(-pure)/full/iterator/reduce
core-js(-pure)/full/iterator/some
core-js(-pure)/full/iterator/take
core-js(-pure)/full/iterator/to-array
core-js(-pure)/full/iterator/to-async
```
[Examples](https://is.gd/P7YLCq):
```js
[1, 2, 3, 4, 5, 6, 7].values()
  .drop(1)
  .take(5)
  .filter(it => it % 2)
  .map(it => it ** 2)
  .toArray(); // => [9, 25]

Iterator.from({
  next: () => ({ done: Math.random() > .9, value: Math.random() * 10 | 0 })
}).toArray(); // => [7, 6, 3, 0, 2, 8]

await AsyncIterator.from([1, 2, 3, 4, 5, 6, 7])
  .drop(1)
  .take(5)
  .filter(it => it % 2)
  .map(it => it ** 2)
  .toArray(); // => [9, 25]

await [1, 2, 3].values().toAsync().map(async it => it ** 2).toArray(); // => [1, 4, 9]
```
###### Caveats:[⬆](#index)
- For preventing prototypes pollution, in the `pure` version, new `%IteratorPrototype%` methods are not added to the real `%IteratorPrototype%`, they available only on wrappers - instead of `[].values().map(fn)` use `Iterator.from([]).map(fn)`.
- Now, we have access to the real `%AsyncIteratorPrototype%` only with usage async generators syntax. So, for compatibility the library with old browsers, we should use `Function` constructor. However, that breaks compatibility with CSP. So, if you wanna use the real `%AsyncIteratorPrototype%`, you should set `USE_FUNCTION_CONSTRUCTOR` option in the `core-js/configurator` to `true`:
```js
const configurator = require('core-js/configurator');

configurator({ USE_FUNCTION_CONSTRUCTOR: true });

require('core-js/full/async-iterator');

(async function * () { /* empty */ })() instanceof AsyncIterator; // => true
```
##### [New `Set` methods](https://github.com/tc39/proposal-set-methods)[⬆](#index)
Modules [`esnext.set.difference`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.difference.js), [`esnext.set.intersection`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.intersection.js), [`esnext.set.is-disjoint-from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.is-disjoint-from.js), [`esnext.set.is-subset-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.is-subset-of.js), [`esnext.set.is-superset-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.is-superset-of.js), [`esnext.set.symmetric-difference`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.symmetric-difference.js), [`esnext.set.union`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.union.js)
```js
class Set {
  difference(iterable: Iterable<mixed>): Set;
  intersection(iterable: Iterable<mixed>): Set;
  isDisjointFrom(iterable: Iterable<mixed>): boolean;
  isSubsetOf(iterable: Iterable<mixed>): boolean;
  isSupersetOf(iterable: Iterable<mixed>): boolean;
  symmetricDifference(iterable: Iterable<mixed>): Set;
  union(iterable: Iterable<mixed>): Set;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/set-methods
core-js(-pure)/full/set/difference
core-js(-pure)/full/set/intersection
core-js(-pure)/full/set/is-disjoint-from
core-js(-pure)/full/set/is-subset-of
core-js(-pure)/full/set/is-superset-of
core-js(-pure)/full/set/symmetric-difference
core-js(-pure)/full/set/union
```
[*Examples*](https://goo.gl/QMQdaJ):
```js
new Set([1, 2, 3]).union([3, 4, 5]);               // => Set {1, 2, 3, 4, 5}
new Set([1, 2, 3]).intersection([3, 4, 5]);        // => Set {3}
new Set([1, 2, 3]).difference([3, 4, 5]);          // => Set {1, 2}
new Set([1, 2, 3]).symmetricDifference([3, 4, 5]); // => Set {1, 2, 4, 5}

new Set([1, 2, 3]).isDisjointFrom([4, 5, 6]);      // => true
new Set([1, 2, 3]).isSubsetOf([5, 4, 3, 2, 1]);    // => true
new Set([5, 4, 3, 2, 1]).isSupersetOf([1, 2, 3]);  // => true
```
##### [`Map.prototype.emplace`](https://github.com/thumbsupep/proposal-upsert)[⬆](#index)
Modules [`esnext.map.emplace`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.emplace.js) and [`esnext.weak-map.emplace`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.weak-map.emplace.js)
```js
class Map {
  emplace(key: any, { update: (value: any, key: any, handler: object) => updated: any, insert: (key: any, handler: object) => value: any): updated | value;
}

class WeakMap {
  emplace(key: any, { update: (value: any, key: any, handler: object) => updated: any, insert: (key: any, handler: object) => value: any): updated | value;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/map-upsert-stage-2
core-js(-pure)/full/map/emplace
core-js(-pure)/full/weak-map/emplace
```
[*Examples*](https://is.gd/ty5I2v):
```js
const map = new Map([['a', 2]]);

map.emplace('a', { update: it => it ** 2, insert: () => 3}); // => 4

map.emplace('b', { update: it => it ** 2, insert: () => 3}); // => 3

console.log(map); // => Map { 'a': 4, 'b': 3 }
```
##### [`Array.fromAsync`](https://github.com/tc39/proposal-array-from-async)[⬆](#index)
Modules [`esnext.array.from-async`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.from-async.js).
```js
class Array {
  static fromAsync(asyncItems: AsyncIterable | Iterable | ArrayLike, mapfn?: (value: any, index: number) => any, thisArg?: any): Array;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/array-from-async-stage-2
core-js(-pure)/full/array/from-async
```
[*Example*](https://goo.gl/Jt7SsD):
```js
await Array.fromAsync((async function * (){ yield * [1, 2, 3] })(), i => i * i); // => [1, 4, 9]
```
##### [`Array.isTemplateObject`](https://github.com/tc39/proposal-array-is-template-object)[⬆](#index)
Module [`esnext.array.is-template-object`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.is-template-object.js)
```js
class Array {
  static isTemplateObject(value: any): boolean
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/array-is-template-object
core-js(-pure)/full/array/is-template-object
```
*Example*:
```js
console.log(Array.isTemplateObject((it => it)`qwe${ 123 }asd`)); // => true
```
##### [`Symbol.{ asyncDispose, dispose }` for `using` statement](https://github.com/tc39/proposal-using-statement)[⬆](#index)
Modules [`esnext.symbol.dispose`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.dispose.js) and [`esnext.symbol.async-dispose`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.async-dispose.js).
```js
class Symbol {
  static asyncDispose: @@asyncDispose;
  static dispose: @@dispose;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/using-statement
core-js(-pure)/full/symbol/async-dispose
core-js(-pure)/full/symbol/dispose
```
##### [`Symbol.metadataKey` for decorators metadata proposal](https://github.com/tc39/proposal-decorator-metadata)[⬆](#index)
Module [`esnext.symbol.metadata-key`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.metadata-key.js).
```js
class Symbol {
  static metadataKey: @@metadataKey;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/decorator-metadata
core-js(-pure)/full/symbol/metadata-key
```

#### Stage 1 proposals[⬆](#index)
[*CommonJS entry points:*](#commonjs-api)
```js
core-js(-pure)/stage/1
```
##### [`Observable`](https://github.com/zenparsing/es-observable)[⬆](#index)
Modules [`esnext.observable`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.observable.js) and [`esnext.symbol.observable`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.observable.js)
```js
class Observable {
  constructor(subscriber: Function): Observable;
  subscribe(observer: Function | { next?: Function, error?: Function, complete?: Function }): Subscription;
  @@observable(): this;
  static of(...items: Aray<mixed>): Observable;
  static from(x: Observable | Iterable): Observable;
  static readonly attribute @@species: this;
}

class Symbol {
  static observable: @@observable;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/observable
core-js(-pure)/full/observable
core-js(-pure)/full/symbol/observable
```
[*Examples*](https://goo.gl/1LDywi):
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
##### [New collections methods](https://github.com/tc39/proposal-collection-methods)[⬆](#index)
Modules [`esnext.set.add-all`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.add-all.js), [`esnext.set.delete-all`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.delete-all.js), [`esnext.set.every`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.every.js), [`esnext.set.filter`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.filter.js), [`esnext.set.find`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.find.js), [`esnext.set.join`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.join.js), [`esnext.set.map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.map.js), [`esnext.set.reduce`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.reduce.js), [`esnext.set.some`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.some.js), [`esnext.map.delete-all`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.delete-all.js), [`esnext.map.every`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.every.js), [`esnext.map.filter`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.filter.js), [`esnext.map.find`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.find.js), [`esnext.map.find-key`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.find-key.js), [`esnext.map.group-by`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.group-by.js), [`esnext.map.includes`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.includes.js), [`esnext.map.key-by`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.key-by.js), [`esnext.map.key-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.key-of.js), [`esnext.map.map-keys`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.map-keys.js), [`esnext.map.map-values`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.map-values.js), [`esnext.map.merge`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.merge.js), [`esnext.map.reduce`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.reduce.js), [`esnext.map.some`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.some.js), [`esnext.map.update`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.update.js), [`esnext.weak-set.add-all`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.weak-set.add-all.js), [`esnext.weak-set.delete-all`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.weak-set.delete-all.js), [`esnext.weak-map.delete-all`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.weak-map.delete-all.js)
##### [`.of` and `.from` methods on collection constructors](https://github.com/tc39/proposal-setmap-offrom)[⬆](#index)
Modules [`esnext.set.of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.of.js), [`esnext.set.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.from.js), [`esnext.map.of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.of.js), [`esnext.map.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.from.js), [`esnext.weak-set.of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.weak-set.of.js), [`esnext.weak-set.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.weak-set.from.js), [`esnext.weak-map.of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.weak-map.of.js), [`esnext.weak-map.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.weak-map.from.js)
```js
class Set {
  static of(...args: Array<mixed>): Set;
  static from(iterable: Iterable<mixed>, mapFn?: (value: any, index: number) => any, thisArg?: any): Set;
  addAll(...args: Array<mixed>): this;
  deleteAll(...args: Array<mixed>): boolean;
  every(callbackfn: (value: any, key: any, target: any) => boolean, thisArg?: any): boolean;
  filter(callbackfn: (value: any, key: any, target: any) => boolean, thisArg?: any): Set;
  find(callbackfn: (value: any, key: any, target: any) => boolean), thisArg?: any): any;
  join(separator: string = ','): string;
  map(callbackfn: (value: any, key: any, target: any) => any, thisArg?: any): Set;
  reduce(callbackfn: (memo: any, value: any, key: any, target: any) => any, initialValue?: any): any;
  some(callbackfn: (value: any, key: any, target: any) => boolean, thisArg?: any): boolean;
}

class Map {
  static groupBy(iterable: Iterable<mixed>, callbackfn?: (value: any) => any): Map;
  static of(...args: Array<[key, value]>): Map;
  static from(iterable: Iterable<mixed>, mapFn?: (value: any, index: number) => [key: any, value: any], thisArg?: any): Map;
  static keyBy(iterable: Iterable<mixed>, callbackfn?: (value: any) => any): Map;
  deleteAll(...args: Array<mixed>): boolean;
  every(callbackfn: (value: any, key: any, target: any) => boolean, thisArg?: any): boolean;
  filter(callbackfn: (value: any, key: any, target: any) => boolean, thisArg?: any): Map;
  find(callbackfn: (value: any, key: any, target: any) => boolean), thisArg?: any): any;
  findKey(callbackfn: (value: any, key: any, target: any) => boolean), thisArg?: any): any;
  includes(searchElement: any): boolean;
  keyOf(searchElement: any): any;
  mapKeys(mapFn: (value: any, index: number, target: any) => any, thisArg?: any): Map;
  mapValues(mapFn: (value: any, index: number, target: any) => any, thisArg?: any): Map;
  merge(...iterables: Array<Iterable>): this;
  reduce(callbackfn: (memo: any, value: any, key: any, target: any) => any, initialValue?: any): any;
  some(callbackfn: (value: any, key: any, target: any) => boolean, thisArg?: any): boolean;
  update(key: any, callbackfn: (value: any, key: any, target: any) => any, thunk?: (key: any, target: any) => any): this;
}

class WeakSet {
  static of(...args: Array<mixed>): WeakSet;
  static from(iterable: Iterable<mixed>, mapFn?: (value: any, index: number) => Object, thisArg?: any): WeakSet;
  addAll(...args: Array<mixed>): this;
  deleteAll(...args: Array<mixed>): boolean;
}

class WeakMap {
  static of(...args: Array<[key, value]>): WeakMap;
  static from(iterable: Iterable<mixed>, mapFn?: (value: any, index: number) => [key: Object, value: any], thisArg?: any): WeakMap;
  deleteAll(...args: Array<mixed>): boolean;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/collection-methods
core-js/proposals/collection-of-from
core-js(-pure)/full/set/add-all
core-js(-pure)/full/set/delete-all
core-js(-pure)/full/set/every
core-js(-pure)/full/set/filter
core-js(-pure)/full/set/find
core-js(-pure)/full/set/from
core-js(-pure)/full/set/join
core-js(-pure)/full/set/map
core-js(-pure)/full/set/of
core-js(-pure)/full/set/reduce
core-js(-pure)/full/set/some
core-js(-pure)/full/map/delete-all
core-js(-pure)/full/map/every
core-js(-pure)/full/map/filter
core-js(-pure)/full/map/find
core-js(-pure)/full/map/find-key
core-js(-pure)/full/map/from
core-js(-pure)/full/map/group-by
core-js(-pure)/full/map/includes
core-js(-pure)/full/map/key-by
core-js(-pure)/full/map/key-of
core-js(-pure)/full/map/map-keys
core-js(-pure)/full/map/map-values
core-js(-pure)/full/map/merge
core-js(-pure)/full/map/of
core-js(-pure)/full/map/reduce
core-js(-pure)/full/map/some
core-js(-pure)/full/map/update
core-js(-pure)/full/weak-set/add-all
core-js(-pure)/full/weak-set/delete-all
core-js(-pure)/full/weak-set/of
core-js(-pure)/full/weak-set/from
core-js(-pure)/full/weak-map/delete-all
core-js(-pure)/full/weak-map/of
core-js(-pure)/full/weak-map/from
```
`.of` / `.from` [*examples*](https://goo.gl/mSC7eU):
```js
Set.of(1, 2, 3, 2, 1); // => Set {1, 2, 3}

Map.from([[1, 2], [3, 4]], ([key, value]) => [key ** 2, value ** 2]); // => Map { 1: 4, 9: 16 }
```
##### [`compositeKey` and `compositeSymbol`](https://github.com/tc39/proposal-richer-keys/tree/master/compositeKey)[⬆](#index)
Modules [`esnext.composite-key`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.composite-key.js) and [`esnext.composite-symbol`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.composite-symbol.js)
```js
function compositeKey(...args: Array<mixed>): object;
function compositeSymbol(...args: Array<mixed>): symbol;
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/keys-composition
core-js(-pure)/full/composite-key
core-js(-pure)/full/composite-symbol
```
[*Examples*](https://goo.gl/2oPAH7):
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

const a = ['a'];
const b = ['b'];
const c = ['c'];

console.log(compositeSymbol(a) === compositeSymbol(a)); // => true
console.log(compositeSymbol(a) !== compositeSymbol(['a'])); // => true
console.log(compositeSymbol(a, 1) === compositeSymbol(a, 1)); // => true
console.log(compositeSymbol(a, b) !== compositeSymbol(b, a)); // => true
console.log(compositeSymbol(a, b, c) === compositeSymbol(a, b, c)); // => true
console.log(compositeSymbol(1, a) === compositeSymbol(1, a)); // => true
console.log(compositeSymbol(1, a, 2, b) === compositeSymbol(1, a, 2, b)); // => true
console.log(compositeSymbol(a, a) === compositeSymbol(a, a)); // => true
```
##### [Array filtering](https://github.com/tc39/proposal-array-filtering)[⬆](#index)
Modules [`esnext.array.filter-reject`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.filter-reject.js) and [`esnext.typed-array.filter-reject`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.typed-array.filter-reject.js).
```js
class Array {
  filterReject(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): Array<mixed>;
}

class %TypedArray% {
  filterReject(callbackfn: (value: number, index: number, target: %TypedArray%) => boolean, thisArg?: any): %TypedArray%;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/array-filtering-stage-1
core-js(-pure)/full/array(/virtual)/filter-reject
core-js/full/typed-array/filter-reject
```
[*Examples*](https://is.gd/jJcoWw):
```js
[1, 2, 3, 4, 5].filterReject(it => it % 2); // => [2, 4]
````
##### [Array deduplication](https://github.com/tc39/proposal-array-unique)[⬆](#index)
Modules [`esnext.array.unique-by`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.unique-by.js) and [`esnext.typed-array.unique-by`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.typed-array.unique-by.js)
```js
class Array {
  uniqueBy(resolver?: (item: any) => any): Array<mixed>;
}

class %TypedArray% {
  uniqueBy(resolver?: (item: any) => any): %TypedArray%;;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/array-unique
core-js(-pure)/full/array(/virtual)/unique-by
core-js/full/typed-array/unique-by
```
[*Examples*](https://is.gd/lilNPu):
```js
[1, 2, 3, 2, 1].uniqueBy(); // [1, 2, 3]

[
  { id: 1, uid: 10000 },
  { id: 2, uid: 10000 },
  { id: 3, uid: 10001 }
].uniqueBy(it => it.id);    // => [{ id: 1, uid: 10000 }, { id: 3, uid: 10001 }]
```
##### [Getting last item from `Array`](https://github.com/keithamus/proposal-array-last)[⬆](#index)
Modules [`esnext.array.last-item`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.last-item.js) and [`esnext.array.last-index`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.last-index.js)
```js
class Array {
  attribute lastItem: any;
  readonly attribute lastIndex: uint;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/array-last
core-js/full/array/last-item
core-js/full/array/last-index
```
[*Examples*](https://goo.gl/2TmcMT):
```js
[1, 2, 3].lastItem;  // => 3
[1, 2, 3].lastIndex; // => 2

const array = [1, 2, 3];
array.lastItem = 4;

array; // => [1, 2, 4]
```
##### [`Number.range`](https://github.com/tc39/proposal-Number.range)[⬆](#index)
Module [`esnext.number.range`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.number.range.js) and [`esnext.bigint.range`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.bigint.range.js)
```js
class Number {
  range(start: number, end: number, options: { step: number = 1, inclusive: boolean = false } | step: number = 1): RangeIterator;
}

class BigInt {
  range(start: bigint, end: bigint | Infinity | -Infinity, options: { step: bigint = 1n, inclusive: boolean = false } | step: bigint = 1n): RangeIterator;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/number-range
core-js(-pure)/full/bigint/range
core-js(-pure)/full/number/range
```
[*Example*](https://is.gd/caCKSb):
```js
for (const i of Number.range(1, 10)) {
  console.log(i); // => 1, 2, 3, 4, 5, 6, 7, 8, 9
}

for (const i of Number.range(1, 10, { step: 3, inclusive: true })) {
  console.log(i); // => 1, 4, 7, 10
}
```
##### [`Number.fromString`](https://github.com/tc39/proposal-number-fromstring)[⬆](#index)
Module [`esnext.number.from-string`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.number.from-string.js)
```js
class Number {
  fromString(string: string, radix: number): number;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/number-from-string
core-js(-pure)/full/number/from-string
```
##### [`Math` extensions](https://github.com/rwaldron/proposal-math-extensions)[⬆](#index)
Modules [`esnext.math.clamp`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.clamp.js), [`esnext.math.deg-per-rad`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.deg-per-rad.js), [`esnext.math.degrees`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.degrees.js), [`esnext.math.fscale`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.fscale.js), [`esnext.math.rad-per-deg`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.rad-per-deg.js), [`esnext.math.radians`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.radians.js) and [`esnext.math.scale`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.scale.js)
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
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/math-extensions
core-js(-pure)/full/math/clamp
core-js(-pure)/full/math/deg-per-rad
core-js(-pure)/full/math/degrees
core-js(-pure)/full/math/fscale
core-js(-pure)/full/math/rad-per-deg
core-js(-pure)/full/math/radians
core-js(-pure)/full/math/scale
```
##### [`Math.signbit`](https://github.com/tc39/proposal-Math.signbit)[⬆](#index)
Module [`esnext.math.signbit`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.signbit.js)
```js
namespace Math {
  signbit(x: number): boolean;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/math-signbit
core-js(-pure)/full/math/signbit
```
[*Examples*](https://goo.gl/rPWbzZ):
```js
Math.signbit(NaN); // => false
Math.signbit(1);   // => false
Math.signbit(-1);  // => true
Math.signbit(0);   // => false
Math.signbit(-0);  // => true
```
##### [`String.cooked`](https://github.com/tc39/proposal-string-cooked)[⬆](#index)
Module [`esnext.string.cooked`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.string.cooked.js)
```js
class String {
  static cooked(template: Array<string>, ...substitutions: Array<string>): string;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/string-cooked
core-js(-pure)/full/string/cooked
```
[*Example*](https://is.gd/7QPnss):
```js
function safePath(strings, ...subs) {
  return String.cooked(strings, ...subs.map(sub => encodeURIComponent(sub)));
}

let id = 'spottie?';

safePath`/cats/${ id }`; // => /cats/spottie%3F
```
##### [`String.prototype.codePoints`](https://github.com/tc39/proposal-string-prototype-codepoints)[⬆](#index)
Module [`esnext.string.code-points`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.string.code-points.js)
```js
class String {
  codePoints(): Iterator<{ codePoint, position }>;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/string-code-points
core-js(-pure)/full/string/code-points
```
[*Example*](https://goo.gl/Jt7SsD):
```js
for (let { codePoint, position } of 'qwe'.codePoints()) {
  console.log(codePoint); // => 113, 119, 101
  console.log(position);  // => 0, 1, 2
}
```
##### [`Symbol.matcher` for pattern matching](https://github.com/tc39/proposal-pattern-matching)[⬆](#index)
Module [`esnext.symbol.matcher`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.matcher.js).
```js
class Symbol {
  static matcher: @@matcher;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/pattern-matching
core-js(-pure)/full/symbol/matcher
```
##### [Seeded pseudo-random numbers](https://github.com/tc39/proposal-seeded-random)[⬆](#index)
**API of this proposal has been changed. This proposal will be removed from the next major `core-js` version and will be added back after adding and stabilization of the spec text.**

Module [`esnext.math.seeded-prng`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.seeded-prng.js)
```js
class Math {
  seededPRNG({ seed: number }): Iterator<number>;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/seeded-random
core-js(-pure)/full/math/seeded-prng
```
[*Example*](https://goo.gl/oj3WgQ):
```js
for (let x of Math.seededPRNG({ seed: 42 })) {
  console.log(x); // => 0.16461519912315087, 0.2203933906000046, 0.8249682894209105
  if (x > .8) break;
}
```
##### [Object iteration](https://github.com/tc39/proposal-object-iteration)[⬆](#index)
**This proposal has been withdrawn and will be removed from the next major `core-js` version.**

Modules [`esnext.object.iterate-keys`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.object.iterate-keys.js), [`esnext.object.iterate-values`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.object.iterate-values.js), [`esnext.object.iterate-entries`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.object.iterate-entries.js).
```js
class Object {
  iterateKeys(object: any): Iterator<string>;
  iterateValues(object: any): Iterator<any>;
  iterateEntries(object: any): Iterator<[string, any]>;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/object-iteration
core-js(-pure)/full/object/iterate-keys
core-js(-pure)/full/object/iterate-values
core-js(-pure)/full/object/iterate-entries
```
[*Example*](https://is.gd/Wnm2tD):
```js
const obj = { foo: 'bar', baz: 'blah' };

for (const [key, value] of Object.iterateEntries(obj)) {
  console.log(`${key} -> ${value}`);
}

for (const key of Object.iterateKeys(obj)) {
  console.log(key);
}

for (const value of Object.iterateValues(obj)) {
  console.log(value);
}
```
##### [`Promise.try`](https://github.com/tc39/proposal-promise-try)[⬆](#index)
**This proposal is dead and will be removed from the next major `core-js` version.**

Module [`esnext.promise.try`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.promise.try.js)
```js
class Promise {
  static try(callbackfn: Function): promise;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/promise-try
core-js(-pure)/full/promise/try
```
[*Examples*](https://goo.gl/k5GGRo):
```js
Promise.try(() => 42).then(it => console.log(`Promise, resolved as ${it}`));

Promise.try(() => { throw 42; }).catch(it => console.log(`Promise, rejected as ${it}`));
```

#### Stage 0 proposals[⬆](#index)
[*CommonJS entry points:*](#commonjs-api)
```js
core-js(-pure)/stage/0
```
##### [`Function.prototype.unThis`](https://github.com/js-choi/proposal-function-un-this)[⬆](#index)
Module [`esnext.function.un-this`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.function.un-this.js)
```js
class Function {
  unThis(): Function;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/function-un-this
core-js(-pure)/full/function/un-this
core-js(-pure)/full/function/virtual/un-this
```
[*Examples*](https://is.gd/t1Bvhn):
```js
const slice = Array.prototype.slice.unThis();

slice([1, 2, 3], 1); // => [2, 3]
```
##### [`Function.{ isCallable, isConstructor }`](https://github.com/caitp/TC39-Proposals/blob/trunk/tc39-reflect-isconstructor-iscallable.md)[⬆](#index)

Modules [`esnext.function.is-callable`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.function.is-callable.js), [`esnext.function.is-constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.function.is-constructor.js)
```js
class Function {
  static isCallable(value: any): boolean;
  static isConstructor(value: any): boolean;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/function-is-callable-is-constructor
core-js(-pure)/full/function/is-callable
core-js(-pure)/full/function/is-constructor
```
[*Examples*](https://is.gd/Kof1he):
```js
Function.isCallable(null);           // => false
Function.isCallable({});             // => false
Function.isCallable(function () {}); // => true
Function.isCallable(() => {});       // => true
Function.isCallable(class {});       // => false

Function.isConstructor(null);           // => false
Function.isConstructor({});             // => false
Function.isConstructor(function () {}); // => true
Function.isConstructor(() => {});       // => false
Function.isConstructor(class {});       // => true
```
##### [`URL`](https://github.com/jasnell/proposal-url)[⬆](#index)
See more info [in web standards namespace](#url-and-urlsearchparams)

##### [`String#at`](https://github.com/mathiasbynens/String.prototype.at)[⬆](#index)
**This proposal has been withdrawn and will be removed from the next major `core-js` version.**

Module [`esnext.string.at`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.string.at.js)
```js
class String {
  at(index: number): string;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/string-at
core-js(-pure)/full/string/at
core-js(-pure)/full/string/virtual/at
```
[*Examples*](https://goo.gl/XluXI8):
```js
'a𠮷b'.at(1);        // => '𠮷'
'a𠮷b'.at(1).length; // => 2
```
##### [Efficient 64 bit arithmetic](https://gist.github.com/BrendanEich/4294d5c212a6d2254703)[⬆](#index)
**This proposal has been withdrawn and will be removed from the next major `core-js` version.**

Modules [`esnext.math.iaddh`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.iaddh.js), [`esnext.math.isubh`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.isubh.js), [`esnext.math.imulh`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.imulh.js) and [`esnext.math.umulh`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.umulh.js)
```js
namespace Math {
  iaddh(lo0: number, hi0: number, lo1: number, hi1: number): number;
  isubh(lo0: number, hi0: number, lo1: number, hi1: number): number;
  imulh(a: number, b: number): number;
  umulh(a: number, b: number): number;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/efficient-64-bit-arithmetic
core-js(-pure)/full/math/iaddh
core-js(-pure)/full/math/isubh
core-js(-pure)/full/math/imulh
core-js(-pure)/full/math/umulh
```

#### Pre-stage 0 proposals[⬆](#index)
[*CommonJS entry points:*](#commonjs-api)
```js
core-js(-pure)/stage/pre
```
##### [`Reflect` metadata](https://github.com/rbuckton/reflect-metadata)[⬆](#index)
Modules [`esnext.reflect.define-metadata`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.reflect.define-metadata.js), [`esnext.reflect.delete-metadata`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.reflect.delete-metadata.js), [`esnext.reflect.get-metadata`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.reflect.get-metadata.js), [`esnext.reflect.get-metadata-keys`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.reflect.get-metadata-keys.js), [`esnext.reflect.get-own-metadata`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.reflect.get-own-metadata.js), [`esnext.reflect.get-own-metadata-keys`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.reflect.get-own-metadata-keys.js), [`esnext.reflect.has-metadata`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.reflect.has-metadata.js), [`esnext.reflect.has-own-metadata`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.reflect.has-own-metadata.js) and [`esnext.reflect.metadata`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.reflect.metadata.js).
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
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/reflect-metadata
core-js(-pure)/full/reflect/define-metadata
core-js(-pure)/full/reflect/delete-metadata
core-js(-pure)/full/reflect/get-metadata
core-js(-pure)/full/reflect/get-metadata-keys
core-js(-pure)/full/reflect/get-own-metadata
core-js(-pure)/full/reflect/get-own-metadata-keys
core-js(-pure)/full/reflect/has-metadata
core-js(-pure)/full/reflect/has-own-metadata
core-js(-pure)/full/reflect/metadata
```
[*Examples*](https://goo.gl/KCo3PS):
```js
let object = {};
Reflect.defineMetadata('foo', 'bar', object);
Reflect.ownKeys(object);               // => []
Reflect.getOwnMetadataKeys(object);    // => ['foo']
Reflect.getOwnMetadata('foo', object); // => 'bar'
```

### [Web standards](docs/Web%20standards.md)[⬆](#index)

### Iteration helpers[⬆](#index)
Helpers for check iterability / get iterator in the `pure` version or, for example, for `arguments` object:
```js
function isIterable(value: any): boolean;
function getIterator(value: any): Object;
function getIteratorMethod(value: any): Function | void;
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js-pure/es|stable|actual|full/is-iterable
core-js-pure/es|stable|actual|full/get-iterator
core-js-pure/es|stable|actual|full/get-iterator-method
```
[*Examples*](https://goo.gl/SXsM6D):
```js
import isIterable from 'core-js-pure/actual/is-iterable';
import getIterator from 'core-js-pure/actual/get-iterator';
import getIteratorMethod from 'core-js-pure/actual/get-iterator-method';

let list = (function () {
  return arguments;
})(1, 2, 3);

console.log(isIterable(list)); // true;

let iterator = getIterator(list);
console.log(iterator.next().value); // 1
console.log(iterator.next().value); // 2
console.log(iterator.next().value); // 3
console.log(iterator.next().value); // undefined

getIterator({}); // TypeError: [object Object] is not iterable!

let method = getIteratorMethod(list);
console.log(typeof method);         // 'function'
let iterator = method.call(list);
console.log(iterator.next().value); // 1
console.log(iterator.next().value); // 2
console.log(iterator.next().value); // 3
console.log(iterator.next().value); // undefined

console.log(getIteratorMethod({})); // undefined
```

## Missing polyfills[⬆](#index)
- ES `BigInt` can't be polyfilled since it requires changes in the behavior of operators, you could find more info [here](https://github.com/zloirock/core-js/issues/381). You could try to use [`JSBI`](https://github.com/GoogleChromeLabs/jsbi).
- ES `Proxy` can't be polyfilled, you can try to use [`proxy-polyfill`](https://github.com/GoogleChrome/proxy-polyfill) which provides a very little subset of features.
- ES `String#normalize` is not a very useful feature, but this polyfill will be very large. If you need it, you can use [unorm](https://github.com/walling/unorm/).
- ECMA-402 `Intl` is missed because of the size. You can use [those polyfills](https://formatjs.io/docs/polyfills).
- `window.fetch` is not a cross-platform feature, in some environments, it makes no sense. For this reason, I don't think it should be in `core-js`. Looking at a large number of requests it *might be*  added in the future. Now you can use, for example, [this polyfill](https://github.com/github/fetch).
