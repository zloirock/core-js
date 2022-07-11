![logo](https://user-images.githubusercontent.com/2213682/146607186-8e13ddef-26a4-4ebf-befd-5aac9d77c090.png)

<div align="center">

[![Open Collective](https://opencollective.com/core-js/all/badge.svg?label=open%20collective)](https://opencollective.com/core-js) [![version](https://img.shields.io/npm/v/core-js.svg)](https://www.npmjs.com/package/core-js) [![core-js downloads](https://img.shields.io/npm/dm/core-js.svg?label=npm%20i%20core-js)](https://npm-stat.com/charts.html?package=core-js&package=core-js-pure&package=core-js-compat&from=2014-11-18) [![core-js-pure downloads](https://img.shields.io/npm/dm/core-js-pure.svg?label=npm%20i%20core-js-pure)](https://npm-stat.com/charts.html?package=core-js&package=core-js-pure&package=core-js-compat&from=2014-11-18) [![jsDelivr](https://data.jsdelivr.com/v1/package/npm/core-js-bundle/badge?style=rounded)](https://www.jsdelivr.com/package/npm/core-js-bundle) [![tests](https://github.com/zloirock/core-js/workflows/tests/badge.svg)](https://github.com/zloirock/core-js/actions) [![eslint](https://github.com/zloirock/core-js/workflows/eslint/badge.svg)](https://github.com/zloirock/core-js/actions)

</div>

> Modular standard library for JavaScript. Includes polyfills for [ECMAScript up to 2021](docs/Features/ECMAScript): [promises](docs/Features/ECMAScript/Promise.md), [symbols](docs/Features/ECMAScript/symbol.md), [collections](docs/Features/ECMAScript/collections.md), iterators, [typed arrays](docs/Features/ECMAScript/typed-array.md), many other features, [ECMAScript proposals](docs/Features/proposals#index), [some cross-platform WHATWG / W3C features and proposals](docs/Features/Web%20standards/README.md) like [`URL`](docs/Features/Web%20standards/url.md). You can load only required features or use it without global namespace pollution.

**If you're looking documentation for obsolete `core-js@2`, please, check [this branch](https://github.com/zloirock/core-js/tree/v2).**

## As advertising: the author is looking for a good job -)

## [core-js@3, babel and a look into the future](docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md)

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

## Index
- [Usage](docs/Usage.md)
  - [Installation](docs/Usage.md#installation)
  - [`postinstall` message](docs/Usage.md#postinstall-message)
  - [CommonJS API](/docs/Usage.md#commonjs-api)
  - [Babel](docs/Usage.md#babel)
    - [`@babel/polyfill`](docs/Usage.md#babelpolyfill)
    - [`@babel/preset-env`](docs/Usage.md#babelpreset-env)
    - [`@babel/runtime`](docs/Usage.md#babelruntime)
  - [swc](docs/Usage.md#swc)
  - [Configurable level of aggressiveness](docs/Usage.md#configurable-level-of-aggressiveness)
  - [Custom build](docs/Usage.md#custom-build)
- [Compatibility data](docs/Compatibility%20data.md)
- [Supported engines](docs/Compatibility%20data.md#supported-engines)
- [Features](docs/Features)
  - [ECMAScript](docs/Features/ECMAScript)
    - [ECMAScript: Object](docs/Features/ECMAScript/object.md)
    - [ECMAScript: Function](docs/Features/ECMAScript/function.md)
    - [ECMAScript: Error](docs/Features/ECMAScript/error.md)
    - [ECMAScript: Array](docs/Features/ECMAScript/array.md)
    - [ECMAScript: String and RegExp](docs/Features/ECMAScript/string%20and%20regexp.md)
    - [ECMAScript: Number](docs/Features/ECMAScript/number.md)
    - [ECMAScript: Math](docs/Features/ECMAScript/math.md)
    - [ECMAScript: Date](docs/Features/ECMAScript/date.md)
    - [ECMAScript: Promise](docs/Features/ECMAScript/promise.md)
    - [ECMAScript: Symbol](docs/Features/ECMAScript/symbol.md)
    - [ECMAScript: Collections](docs/Features/ECMAScript/collections.md)
    - [ECMAScript: Typed Arrays](docs/Features/ECMAScript/typed-array.md)
    - [ECMAScript: Reflect](docs/Features/ECMAScript/reflect.md)
    - [ECMAScript: JSON](docs/Features/ECMAScript/json.md)
    - [ECMAScript: globalThis](docs/Features/ECMAScript/global-this.md)
  - [ECMAScript proposals](docs/Features/proposals)
    - [Finished proposals](docs/Features/proposals#finished)
      - [`globalThis`](docs/Features/proposals/global-this.md)
      - [Relative indexing method](docs/Features/proposals/relative-indexing-method.md)
      - [`Array.prototype.includes`](docs/Features/proposals/array-includes.md)
      - [`Array.prototype.flat` / `Array.prototype.flatMap`](docs/Features/proposals/array-flat-map.md)
      - [`Array` find from last](docs/Features/proposals/array-find-from-last.md)
      - [`Object.values` / `Object.entries`](docs/Features/proposals/object-values-entries.md)
      - [`Object.fromEntries`](docs/Features/proposals/object-from-entries.md)
      - [`Object.getOwnPropertyDescriptors`](docs/Features/proposals/object-getownpropertydescriptors.md)
      - [Accessible `Object.prototype.hasOwnProperty`](docs/Features/proposals/accessible-object-hasownproperty.md)
      - [`String` padding](docs/Features/proposals/string-padding.md)
      - [`String.prototype.matchAll`](docs/Features/proposals/string-match-all.md)
      - [`String.prototype.replaceAll`](docs/Features/proposals/string-replace-all.md)
      - [`String.prototype.trimStart` / `String.prototype.trimEnd`](docs/Features/proposals/string-left-right-trim.md)
      - [`RegExp` `s` (`dotAll`) flag](docs/Features/proposals/regexp-dotall-flag.md)
      - [`RegExp` named capture groups](docs/Features/proposals/regexp-named-groups.md)
      - [`Promise.allSettled`](docs/Features/proposals/promise-all-settled.md)
      - [`Promise.any`](docs/Features/proposals/promise-any.md)
      - [`Promise.prototype.finally`](docs/Features/proposals/promise-finally.md)
      - [`Symbol.asyncIterator` for asynchronous iteration](docs/Features/proposals/async-iteration.md)
      - [`Symbol.prototype.description`](docs/Features/proposals/symbol-description.md)
      - [Well-formed `JSON.stringify`](docs/Features/proposals/well-formed-stringify.md)
    - [Stage 3 proposals](docs/Features/proposals#stage-3)
      - [`Array` grouping](docs/Features/proposals/array-grouping.md)
      - [Change `Array` by copy](docs/Features/proposals/change-array-by-copy.md)
    - [Stage 2 proposals](docs/Features/proposals#stage-2)
      - [`Iterator` helpers](docs/Features/proposals/iterator-helpers.md)
      - [New `Set` methods](docs/Features/proposals/set-methods.md)
      - [`Map.prototype.emplace`](docs/Features/proposals/map-emplace.md)
      - [`Array.fromAsync`](docs/Features/proposals/array-from-async.md)
      - [`Array.isTemplateObject`](docs/Features/proposals/array-is-template-object.md)
      - [`Symbol.{ asyncDispose, dispose }` for `using` statement](docs/Features/proposals/using-statement.md)
      - [`Symbol.metadataKey` for decorators metadata proposal](docs/Features/proposals/decorator-metadata.md)
    - [Stage 1 proposals](docs/Features/proposals#stage-1)
      - [`Observable`](docs/Features/proposals/observable.md)
      - [New collections methods](docs/Features/proposals/collection-methods.md)
      - [`.of` and `.from` methods on collection constructors](docs/Features/proposals/collection-of-from.md)
      - [`compositeKey` and `compositeSymbol`](docs/Features/proposals/keys-composition.md)
      - [`Array` filtering](docs/Features/proposals/array-filtering.md)
      - [`Array` deduplication](docs/Features/proposals/array-unique.md)
      - [Getting last item from `Array`](docs/Features/proposals/array-find-from-last.md)
      - [`Number.range`](docs/Features/proposals/number-range.md)
      - [`Number.fromString`](docs/Features/proposals/number-from-string.md)
      - [`Math` extensions](docs/Features/proposals/math-extensions.md)
      - [`Math.signbit`](docs/Features/proposals/math-signbit.md)
      - [`String.cooked`](docs/Features/proposals/string-cooked.md)
      - [`String.prototype.codePoints`](docs/Features/proposals/string-code-points.md)
      - [`Symbol.matcher` for pattern matching](docs/Features/proposals/pattern-matching.md)
    - [Stage 0 proposals](docs/Features/proposals#stage-0)
      - [`Function.prototype.unThis`](docs/Features/proposals/function-un-this.md)
      - [`Function.{ isCallable, isConstructor }`](docs/Features/proposals/function-is-callable-is-constructor.md)
      - [`URL`](docs/Features/proposals/url.md)
    - [Pre-stage 0 proposals](docs/Features/proposals#pre-stage-0)
      - [`Reflect` metadata](docs/Features/proposals/reflect-metadata.md)
  - [Web standards](docs/Features/Web%20standards)
    - [`structuredClone`](docs/Features/Web%20standards/structured-clone.md)
    - [Base64 utility methods](docs/Features/Web%20standards/Base64%20utility%20methods.md)
    - [`setTimeout` and `setInterval`](docs/Features/Web%20standards/set-timeout%20and%20set-interval.md)
    - [`setImmediate`](docs/Features/Web%20standards/set-immediate.md)
    - [`queueMicrotask`](docs/Features/Web%20standards/queue-microtask.md)
    - [`URL` and `URLSearchParams`](docs/Features/Web%20standards/url.md)
    - [`DOMException`](docs/Features/Web%20standards/dom-exception.md)
    - [Iterable DOM collections](docs/Features/Web%20standards/Iterable%20DOM%20collections.md)
  - [Iteration helpers](docs/Features/Iteration%20helpers.md)
- [Missing polyfills](docs/Missing%20polyfills.md)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Changelog](CHANGELOG.md)

### [Usage](docs/Usage.md)
#### [Installation:](docs/Usage.md#installation)
#### [`postinstall` message](docs/Usage.md#postinstall-message)
#### [CommonJS API](docs/Usage.md#commonjs-api)
#### [Babel](docs/Usage.md#babel)
##### [`@babel/polyfill`](docs/Usage.md#babelpolyfill)
##### [`@babel/preset-env`](docs/Usage.md#babelpreset-env)
##### [`@babel/runtime`](docs/Usage.md#babelruntime)
#### [swc](docs/Usage.md#swc)
#### [Configurable level of aggressiveness](docs/Usage.md#configurable-level-of-aggressiveness)
#### [Custom build](docs/Usage.md#custom-build)

### [Compatibility data](docs/Compatibility%20data.md)

### [Supported engines](docs/Compatibility%20data.md#supported-engines)

### [Features:](docs/Features)
[*CommonJS entry points:*](docs/Usage.md#commonjs-api)
```
core-js(-pure)
```

#### [ECMAScript](docs/Features/ECMAScript)
[*CommonJS entry points:*](docs/Usage.md#commonjs-api)
```
core-js(-pure)/es
```
##### [ECMAScript: Object](docs/Features/ECMAScript/object.md)
##### [ECMAScript: Function](docs/Features/ECMAScript/function.md)
##### [ECMAScript: Error](docs/Features/ECMAScript/error.md)
##### [ECMAScript: Array](docs/Features/ECMAScript/array.md)
##### [ECMAScript: String and RegExp](docs/Features/ECMAScript/string%20and%20regexp.md)
##### [ECMAScript: Number](docs/Features/ECMAScript/number.md)
##### [ECMAScript: Math](docs/Features/ECMAScript/math.md)
##### [ECMAScript: Date](docs/Features/ECMAScript/date.md)
##### [ECMAScript: Promise](docs/Features/ECMAScript/promise.md)
##### [ECMAScript: Symbol](docs/Features/ECMAScript/symbol.md)
##### [ECMAScript: Collections](docs/Features/ECMAScript/collections.md)
###### [Map](docs/Features/ECMAScript/collections.mp#map)
###### [Set](docs/Features/ECMAScript/collections.md#set)
###### [WeakMap](docs/Features/ECMAScript/collections#weakmap)
###### [WeakSet](docs/Features/ECMAScript/collections#weakset)

##### [ECMAScript: Typed Arrays](docs/Features/ECMAScript/typed-array.md)
##### [ECMAScript: Reflect](docs/Features/ECMAScript/reflect.md)
##### [ECMAScript: JSON](docs/Features/ECMAScript/json.md)
##### [ECMAScript: globalThis](docs/Features/ECMAScript/global-this.md)

#### [ECMAScript proposals](docs/Features/proposals/README.md)
[The TC39 process.](https://tc39.github.io/process-document/)

##### [Finished proposals](docs/Features/proposals/README.md#finished)
###### [`globalThis`](docs/Features/proposals.md#globalthis)
###### [Relative indexing method](docs/Features/proposals.md#relative-indexing-method)
###### [`Array.prototype.includes`](docs/Features/proposals.md#arrayprototypeincludes)
###### [`Array.prototype.flat` / `Array.prototype.flatMap`](docs/Features/proposals.md#arrayprototypeflat--arrayprototypeflatmap)
###### [Array find from last](docs/Features/proposals.md#array-find-from-last)
###### [`Object.values` / `Object.entries`](docs/Features/proposals.md#objectvalues--objectentries)
###### [`Object.fromEntries`](docs/Features/proposals.md#objectfromentries)
###### [`Object.getOwnPropertyDescriptors`](docs/Features/proposals.md#objectgetownpropertydescriptors)
###### [Accessible `Object.prototype.hasOwnProperty`](docs/Features/proposals.md#accessible-objectprototypehasownproperty)
###### [`String` padding](docs/Features/proposals.md#string-padding)
###### [`String#matchAll`](docs/Features/proposals.md#stringmatchall)
###### [`String#replaceAll`](docs/Features/proposals.md#stringreplaceall)


##### [Stage 3 proposals](docs/Features/proposals/README.md#stage-3)

##### [Stage 2 proposals](docs/Features/proposals/README.md#stage-2)

##### [Stage 1 proposals](docs/Features/proposals/README.md#stage-1)

##### [Stage 0 proposals](docs/Features/proposals/README.md#stage-0)

##### [Pre-stage 0 proposals](docs/Features/proposals/README.md#pre-stage-0)


#### [Web standards](docs/Features/Web%20standards/README.md)
##### [`structuredClone`](docs/Features/Web%20standards/structuredclone)
##### [Base64 utility methods](docs/Features/Web%20standards/Base64%20utility%20methods.md)
##### [`setTimeout` and `setInterval`](docs/Features/Web%20standards/set-timeout%20and%20set-interval.md)
##### [`setImmediate`](docs/Features/Web%20standards/set-immediate.md)
##### [`QueueMicrotask`](docs/Features/Web%20standards/queue-microtask.md)
##### [`URL` and `URLSearchParams`](docs/Features/Web%20standards/url.md)
##### [`DOMException`](docs/Features/Web%20standards/dom-exception.md)
##### [Iterable DOM collections](docs/Features/Web%20standards/Iterable%20DOM%20collections.md)

#### [Iteration helpers](docs/Features/Iteration%20helpers.md)

### [Missing polyfills](docs/Missing%20polyfills.md)
