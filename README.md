![logo](https://user-images.githubusercontent.com/2213682/146607186-8e13ddef-26a4-4ebf-befd-5aac9d77c090.png)

<div align="center">

[![Open Collective](https://opencollective.com/core-js/all/badge.svg?label=open%20collective)](https://opencollective.com/core-js) [![version](https://img.shields.io/npm/v/core-js.svg)](https://www.npmjs.com/package/core-js) [![core-js downloads](https://img.shields.io/npm/dm/core-js.svg?label=npm%20i%20core-js)](https://npm-stat.com/charts.html?package=core-js&package=core-js-pure&package=core-js-compat&from=2014-11-18) [![core-js-pure downloads](https://img.shields.io/npm/dm/core-js-pure.svg?label=npm%20i%20core-js-pure)](https://npm-stat.com/charts.html?package=core-js&package=core-js-pure&package=core-js-compat&from=2014-11-18) [![jsDelivr](https://data.jsdelivr.com/v1/package/npm/core-js-bundle/badge?style=rounded)](https://www.jsdelivr.com/package/npm/core-js-bundle) [![tests](https://github.com/zloirock/core-js/workflows/tests/badge.svg)](https://github.com/zloirock/core-js/actions) [![eslint](https://github.com/zloirock/core-js/workflows/eslint/badge.svg)](https://github.com/zloirock/core-js/actions)

</div>

> Modular standard library for JavaScript. Includes polyfills for [ECMAScript up to 2021](#ecmascript): [promises](#ecmascript-promise), [symbols](#ecmascript-symbol), [collections](#ecmascript-collections), iterators, [typed arrays](#ecmascript-typed-arrays), many other features, [ECMAScript proposals](#ecmascript-proposals), [some cross-platform WHATWG / W3C features and proposals](#web-standards) like [`URL`](#url-and-urlsearchparams). You can load only required features or use it without global namespace pollution.

**If you're looking documentation for obsolete `core-js@2`, please, check [this branch](https://github.com/zloirock/core-js/tree/v2).**

## As advertising: the author is looking for a good job -)

## [core-js@3, babel and a look into the future](/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md)

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
  - [CommonJS API](/docs/Usage.md#commonjs-api)
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
    - [`structuredClone`](#structuredclone)
    - [Base64 utility methods](#base64-utility-methods)
    - [`setTimeout` and `setInterval`](#settimeout-and-setinterval)
    - [`setImmediate`](#setimmediate)
    - [`queueMicrotask`](#queuemicrotask)
    - [`URL` and `URLSearchParams`](#url-and-urlsearchparams)
    - [`DOMException`](#domexception)
    - [Iterable DOM collections](#iterable-dom-collections)
  - [Iteration helpers](#iteration-helpers)
- [Missing polyfills](#missing-polyfills)
- [Contributing](./CONTRIBUTING.md)
- [Security policy](/SECURITY.md)
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

### [ECMAScript](docs/Features/ECMAScript)[⬆](#index)
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
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
#### [ECMAScript: Collections](docs/Features/ECMAScript/Collections)
`core-js` uses native collections in most cases, just fixes methods / constructor, if it's required, and in old environments uses fast polyfill (O(1) lookup).
##### [Map](docs/Features/ECMAScript/Collections/Map.md)
##### [Set](docs/Features/ECMAScript/Collections/Set.md)
##### [WeakMap](docs/Features/ECMAScript/Collections/WeakMap.md)
##### [WeakSet](docs/Features/ECMAScript/Collections/WeakSet.md)
##### Caveats when using collections polyfill:[⬆](#index)
* Weak-collections polyfill stores values as hidden properties of keys. It works correctly and doesn't leak in most cases. However, it is desirable to store a collection longer than its keys.

#### [ECMAScript: Typed Arrays](docs/Features/ECMAScript/Typed%20Arrays.md)
#### [ECMAScript: Reflect](docs/Features/ECMAScript/Reflect.md)
#### [ECMAScript: JSON](docs/Features/ECMAScript/JSON.md)
#### [ECMAScript: globalThis](docs/Features/ECMAScript/globalThis.md)

### [ECMAScript proposals](docs/Features/ECMAScript/Proposals)[⬆](#index)
[The TC39 process.](https://tc39.github.io/process-document/)

#### [Finished proposals](docs/Features/ECMAScript/Proposals/README.md#finished)[⬆](#index)
##### [`globalThis`](docs/Features/ECMAScript/Proposals.md#globalthis)
##### [Relative indexing method](docs/Features/ECMAScript/Proposals.md#relative-indexing-method)
##### [`Array.prototype.includes`](docs/Features/ECMAScript/Proposals.md#arrayprototypeincludes)
##### [`Array.prototype.flat` / `Array.prototype.flatMap`](docs/Features/ECMAScript/Proposals.md#arrayprototypeflat--arrayprototypeflatmap)
##### [Array find from last](docs/Features/ECMAScript/Proposals.md#array-find-from-last)
##### [`Object.values` / `Object.entries`](docs/Features/ECMAScript/Proposals.md#objectvalues--objectentries)
##### [`Object.fromEntries`](docs/Features/ECMAScript/Proposals.md#objectfromentries)
##### [`Object.getOwnPropertyDescriptors`](docs/Features/ECMAScript/Proposals.md#objectgetownpropertydescriptors)
##### [Accessible `Object.prototype.hasOwnProperty`](docs/Features/ECMAScript/Proposals.md#accessible-objectprototypehasownproperty)
##### [`String` padding](docs/Features/ECMAScript/Proposals.md#string-padding)
##### [`String#matchAll`](docs/Features/ECMAScript/Proposals.md#stringmatchall)
##### [`String#replaceAll`](docs/Features/ECMAScript/Proposals.md#stringreplaceall)


#### [Stage 3 proposals](docs/Features/ECMAScript/Proposals/README.md#stage-3)[⬆](#index)

#### [Stage 2 proposals](docs/Features/ECMAScript/Proposals/README.md#stage-2)[⬆](#index)

#### [Stage 1 proposals](docs/Features/ECMAScript/Proposals/README.md#stage-1)[⬆](#index)

#### [Stage 0 proposals](docs/Features/ECMAScript/Proposals/README.md#stage-0)[⬆](#index)

#### [Pre-stage 0 proposals](docs/Features/ECMAScript/Proposals/README.md#pre-stage-0)[⬆](#index)


### [Web standards](docs/Features/Web%20standards.md)[⬆](#index)
#### [`structuredClone`](docs/Features/Web%20standards.md#structuredclone)
#### [Base64 utility methods](docs/Features/Web%20standards.md#base64-utility-methods)
#### [`setTimeout` and `setInterval`](docs/Features/Web%20standards.md#settimeout-and-setinterval)
#### [`setImmediate`](docs/Features/Web%20standards.md#setimmediate)
#### [`queueMicrotask`](docs/Features/Web%20standards.md#queuemicrotask)
#### [`URL` and `URLSearchParams`](docs/Features/Web%20standards.md#url-and-urlsearchparams)
#### [`DOMException`](docs/Features/Web%20standards.md#domexception)
#### [Iterable DOM collections](docs/Features/Web%20standards.md#iterable-dom-collections)

### [Iteration helpers](/docs/Features/Iteration%20helpers.md)[⬆](#index)

## Missing polyfills[⬆](#index)
- ES `BigInt` can't be polyfilled since it requires changes in the behavior of operators, you could find more info [here](https://github.com/zloirock/core-js/issues/381). You could try to use [`JSBI`](https://github.com/GoogleChromeLabs/jsbi).
- ES `Proxy` can't be polyfilled, you can try to use [`proxy-polyfill`](https://github.com/GoogleChrome/proxy-polyfill) which provides a very little subset of features.
- ES `String#normalize` is not a very useful feature, but this polyfill will be very large. If you need it, you can use [unorm](https://github.com/walling/unorm/).
- ECMA-402 `Intl` is missed because of the size. You can use [those polyfills](https://formatjs.io/docs/polyfills).
- `window.fetch` is not a cross-platform feature, in some environments, it makes no sense. For this reason, I don't think it should be in `core-js`. Looking at a large number of requests it *might be*  added in the future. Now you can use, for example, [this polyfill](https://github.com/github/fetch).
