![logo](https://user-images.githubusercontent.com/2213682/146607186-8e13ddef-26a4-4ebf-befd-5aac9d77c090.png)

<div align="center">

[![fundraising](https://opencollective.com/core-js/all/badge.svg?label=fundraising)](https://opencollective.com/core-js) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/zloirock/core-js/blob/master/CONTRIBUTING.md) [![version](https://img.shields.io/npm/v/core-js.svg)](https://www.npmjs.com/package/core-js) [![core-js downloads](https://img.shields.io/npm/dm/core-js.svg?label=npm%20i%20core-js)](https://npm-stat.com/charts.html?package=core-js&package=@core-js/pure&package=@core-js/compat&from=2014-11-18) [![@core-js/pure downloads](https://img.shields.io/npm/dm/@core-js/pure.svg?label=npm%20i%20@core-js/pure)](https://npm-stat.com/charts.html?package=core-js&package=@core-js/pure&package=@core-js/compat&from=2014-11-18)

</div>

**Welcome to our new website, [core-js.io](https://core-js.io), where our documentation is moving!**
---

**I highly recommend reading this: [So, what's next?](https://core-js.io/blog/2023-02-14-so-whats-next)**
---

> Modular standard library for JavaScript. Includes polyfills for [ECMAScript up to 2026](#ecmascript): [promises](#ecmascript-promise), [symbols](#ecmascript-symbol), [collections](#ecmascript-collections), iterators, [typed arrays](#ecmascript-typed-arrays), many other features, [ECMAScript proposals](#ecmascript-proposals), [some cross-platform WHATWG / W3C features and proposals](#web-standards) like [`URL`](#url-and-urlsearchparams). You can load only required features or use it without global namespace pollution.

## [core-js@3, babel and a look into the future](https://core-js.io/blog/2019-03-19-core-js-3-babel-and-a-look-into-the-future)

## Raising funds

`core-js` isn't backed by a company, so the future of this project depends on you. Become a sponsor or a backer if you are interested in `core-js`: [**Open Collective**](https://opencollective.com/core-js), [**Patreon**](https://patreon.com/zloirock), [**Boosty**](https://boosty.to/zloirock), **Bitcoin ( bc1qlea7544qtsmj2rayg0lthvza9fau63ux0fstcz )**, [**Alipay**](https://user-images.githubusercontent.com/2213682/219464783-c17ad329-17ce-4795-82a7-f609493345ed.png).

---

<a href="https://opencollective.com/core-js/sponsor/0/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/0/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/1/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/1/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/2/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/2/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/3/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/3/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/4/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/4/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/5/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/5/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/6/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/6/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/7/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/7/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/8/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/8/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/9/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/9/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/10/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/10/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/11/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/11/avatar.svg"></a>

---

<a href="https://opencollective.com/core-js#backers" target="_blank"><img src="https://opencollective.com/core-js/backers.svg?width=890"></a>

---

[*Example of usage*](https://core-js.io/playground#code=import+%27core-js%2Factual%27%3B%0A%0APromise.try%28%28%29+%3D%3E+42%29.then%28it+%3D%3E+console.log%28it%29%29%3B+%2F%2F+-%3E+42%0A%0AArray.from%28new+Set%28%5B1%2C+2%2C+3%5D%29.union%28new+Set%28%5B3%2C+4%2C+5%5D%29%29%29%3B+%2F%2F+%3D%3E+%5B1%2C+2%2C+3%2C+4%2C+5%5D%0A%0A%5B1%2C+2%5D.flatMap%28it+%3D%3E+%5Bit%2C+it%5D%29%3B+%2F%2F+%3D%3E+%5B1%2C+1%2C+2%2C+2%5D%0A%0AIterator.concat%28%5B1%2C+2%5D%2C+function+%2A+%28i%29+%7B+while+%28true%29+yield+i%2B%2B%3B+%7D%283%29%29%0A++.drop%281%29.take%285%29%0A++.filter%28it+%3D%3E+it+%25+2%29%0A++.map%28it+%3D%3E+it+%2A%2A+2%29%0A++.toArray%28%29%3B+%2F%2F+%3D%3E+%5B9%2C+25%5D%0A%0AstructuredClone%28new+Set%28%5B1%2C+2%2C+3%5D%29%29%3B+%2F%2F+%3D%3E+Set+%7B+1%2C+2%2C+3+%7D):
```js
import 'core-js/actual';

Promise.try(() => 42).then(it => console.log(it)); // -> 42

Array.from(new Set([1, 2, 3]).union(new Set([3, 4, 5]))); // => [1, 2, 3, 4, 5]

[1, 2].flatMap(it => [it, it]); // => [1, 1, 2, 2]

Iterator.concat([1, 2], function * (i) { while (true) yield i++; }(3))
  .drop(1).take(5)
  .filter(it => it % 2)
  .map(it => it ** 2)
  .toArray(); // => [9, 25]

structuredClone(new Set([1, 2, 3])); // => Set { 1, 2, 3 }
```

*You can load only required features*:
```js
import 'core-js/actual/promise';
import 'core-js/actual/set';
import 'core-js/actual/iterator';
import 'core-js/actual/array/from';
import 'core-js/actual/array/flat-map';
import 'core-js/actual/structured-clone';

Promise.try(() => 42).then(it => console.log(it)); // -> 42

Array.from(new Set([1, 2, 3]).union(new Set([3, 4, 5]))); // => [1, 2, 3, 4, 5]

[1, 2].flatMap(it => [it, it]); // => [1, 1, 2, 2]

Iterator.concat([1, 2], function * (i) { while (true) yield i++; }(3))
  .drop(1).take(5)
  .filter(it => it % 2)
  .map(it => it ** 2)
  .toArray(); // => [9, 25]

structuredClone(new Set([1, 2, 3])); // => Set { 1, 2, 3 }
```

*Or use it without global namespace pollution*:
```js
import Promise from '@core-js/pure/actual/promise';
import Set from '@core-js/pure/actual/set';
import Iterator from '@core-js/pure/actual/iterator';
import from from '@core-js/pure/actual/array/from';
import flatMap from '@core-js/pure/actual/array/flat-map';
import structuredClone from '@core-js/pure/actual/structured-clone';

Promise.try(() => 42).then(it => console.log(it)); // -> 42

from(new Set([1, 2, 3]).union(new Set([3, 4, 5]))); // => [1, 2, 3, 4, 5]

flatMap([1, 2], it => [it, it]); // => [1, 1, 2, 2]

Iterator.concat([1, 2], function * (i) { while (true) yield i++; }(3))
  .drop(1).take(5)
  .filter(it => it % 2)
  .map(it => it ** 2)
  .toArray(); // => [9, 25]

structuredClone(new Set([1, 2, 3])); // => Set { 1, 2, 3 }
```

### Index
- [Usage](#usage)
  - [Installation](#installation)
  - [CommonJS API](#commonjs-api)
  - [Babel](#babel)
    - [`@babel/polyfill`](#babelpolyfill)
    - [`@babel/preset-env`](#babelpreset-env)
    - [`@babel/runtime`](#babelruntime)
    - [`babel-plugin-polyfill-corejs3`](#babel-plugin-polyfill-corejs3)
  - [swc](#swc)
  - [Custom build](#custom-build)
- [Supported engines and compatibility data](#supported-engines-and-compatibility-data)
- [Features](#features)
  - [ECMAScript](#ecmascript)
    - [ECMAScript: Object](#ecmascript-object)
    - [ECMAScript: Function](#ecmascript-function)
    - [ECMAScript: Error](#ecmascript-error)
    - [ECMAScript: Array](#ecmascript-array)
    - [ECMAScript: Iterator](#ecmascript-iterator)
    - [ECMAScript: String and RegExp](#ecmascript-string-and-regexp)
    - [ECMAScript: Number](#ecmascript-number)
    - [ECMAScript: Math](#ecmascript-math)
    - [ECMAScript: Date](#ecmascript-date)
    - [ECMAScript: Promise](#ecmascript-promise)
    - [ECMAScript: Symbol](#ecmascript-symbol)
    - [ECMAScript: Collections](#ecmascript-collections)
    - [ECMAScript: Explicit resource management](#ecmascript-explicit-resource-management)
    - [ECMAScript: Typed arrays](#ecmascript-typed-arrays)
    - [ECMAScript: Reflect](#ecmascript-reflect)
    - [ECMAScript: JSON](#ecmascript-json)
    - [ECMAScript: globalThis](#ecmascript-globalthis)
  - [ECMAScript proposals](#ecmascript-proposals)
    - [Finished proposals](#finished-proposals)
      - [`globalThis`](#globalthis)
      - [Relative indexing method](#relative-indexing-method)
      - [`Array.prototype.includes`](#arrayprototypeincludes)
      - [`Array.prototype.flat` / `Array.prototype.flatMap`](#arrayprototypeflat--arrayprototypeflatmap)
      - [Array find from last](#array-find-from-last)
      - [Change `Array` by copy](#change-array-by-copy)
      - [`Array` grouping](#array-grouping)
      - [`Array.fromAsync`](#arrayfromasync)
      - [`ArrayBuffer.prototype.transfer` and friends](#arraybufferprototypetransfer-and-friends)
      - [`Uint8Array` to / from base64 and hex](#uint8array-to--from-base64-and-hex)
      - [`Error` cause](#error-cause)
      - [`Error.isError`](#erroriserror)
      - [Explicit resource management](#explicit-resource-management)
      - [`Float16` methods](#float16-methods)
      - [`Iterator` helpers](#iterator-helpers)
      - [`Iterator` sequencing](#iterator-sequencing)
      - [`Iterator` chunking](#iterator-chunking)
      - [`Iterator` includes](#iterator-includes)
      - [`Iterator` join](#iterator-join)
      - [Joint iteration](#joint-iteration)
      - [`Object.values` / `Object.entries`](#objectvalues--objectentries)
      - [`Object.fromEntries`](#objectfromentries)
      - [`Object.getOwnPropertyDescriptors`](#objectgetownpropertydescriptors)
      - [Accessible `Object.prototype.hasOwnProperty`](#accessible-objectprototypehasownproperty)
      - [`String` padding](#string-padding)
      - [`String.prototype.matchAll`](#stringprototypematchall)
      - [`String.prototype.replaceAll`](#stringprototypereplaceall)
      - [`String.prototype.trimStart` / `String.prototype.trimEnd`](#stringprototypetrimstart--stringprototypetrimend)
      - [`RegExp` `s` (`dotAll`) flag](#regexp-s-dotall-flag)
      - [`RegExp` named capture groups](#regexp-named-capture-groups)
      - [`RegExp` escaping](#regexp-escaping)
      - [`Promise.allSettled`](#promiseallsettled)
      - [`Promise.any`](#promiseany)
      - [`Promise.prototype.finally`](#promiseprototypefinally)
      - [`Promise.try`](#promisetry)
      - [`Promise.withResolvers`](#promisewithresolvers)
      - [`Symbol.asyncIterator` for asynchronous iteration](#symbolasynciterator-for-asynchronous-iteration)
      - [`Symbol.prototype.description`](#symbolprototypedescription)
      - [`JSON.parse` source text access](#jsonparse-source-text-access)
      - [Well-formed `JSON.stringify`](#well-formed-jsonstringify)
      - [Well-formed Unicode strings](#well-formed-unicode-strings)
      - [New `Set` methods](#new-set-methods)
      - [`Map` upsert](#map-upsert)
      - [`Math.sumPrecise`](#mathsumprecise)
    - [Stage 3 proposals](#stage-3-proposals)
      - [Await dictionary](#await-dictionary)
    - [Stage 2.7 proposals](#stage-27-proposals)
      - [`Symbol.metadata` for the decorator metadata proposal](#symbolmetadata-for-the-decorator-metadata-proposal)
    - [Stage 2 proposals](#stage-2-proposals)
      - [`AsyncIterator` helpers](#asynciterator-helpers)
      - [`Iterator.range`](#iteratorrange)
      - [`Number.prototype.clamp`](#numberprototypeclamp)
      - [`String.dedent`](#stringdedent)
      - [`Symbol` predicates](#symbol-predicates)
      - [`Symbol.customMatcher` for extractors](#symbolcustommatcher-for-extractors)
      - [`Object.keysLength`](#objectkeyslength)
    - [Stage 1 proposals](#stage-1-proposals)
      - [`.of` and `.from` methods on collection constructors](#of-and-from-methods-on-collection-constructors)
      - [Array filtering](#array-filtering)
      - [Array deduplication](#array-deduplication)
      - [`DataView` get / set `Uint8Clamped` methods](#dataview-get--set-uint8clamped-methods)
      - [`String.cooked`](#stringcooked)
      - [`Symbol.customMatcher` for pattern matching](#symbolcustommatcher-for-pattern-matching)
    - [Stage 0 proposals](#stage-0-proposals)
      - [`Function.prototype.demethodize`](#functionprototypedemethodize)
  - [Web standards](#web-standards)
    - [`self`](#self)
    - [`structuredClone`](#structuredclone)
    - [Base64 utility methods](#base64-utility-methods)
    - [`setImmediate`](#setimmediate)
    - [`queueMicrotask`](#queuemicrotask)
    - [`URL` and `URLSearchParams`](#url-and-urlsearchparams)
    - [`DOMException`](#domexception)
    - [Iterable DOM collections](#iterable-dom-collections)
  - [Iteration helpers](#iteration-helpers)
- [Missing polyfills](#missing-polyfills)
- [Contributing](./CONTRIBUTING.md)
- [Security policy](https://github.com/zloirock/core-js/blob/master/SECURITY.md)
- [Changelog](./CHANGELOG.md)

## Usage[⬆](#index)
### Installation:[⬆](#index)
```sh
# global version
npm install --save core-js@4.0.0-alpha.1
# version without global namespace pollution
npm install --save @core-js/pure@4.0.0-alpha.1
# bundled global version
npm install --save @core-js/bundle@4.0.0-alpha.1
```

### CommonJS API[⬆](#index)
You can import only the polyfills you need, like in the examples at the top of `README.md`. CommonJS entry points are available for all polyfilled methods / constructors and namespaces. Just some examples:

```ts
// polyfill all `core-js` features, including early-stage proposals:
import "core-js";
// or:
import "core-js/full";
// polyfill all actual features - stable ES, web standards and stage 3 ES proposals:
import "core-js/actual";
// polyfill only stable features - ES and web standards:
import "core-js/stable";
// polyfill only stable ES features:
import "core-js/es";

// if you want to polyfill `Set`:
// all `Set`-related features, with early-stage ES proposals:
import "core-js/full/set";
// stable required for `Set` ES features, features from web standards and stage 3 ES proposals:
import "core-js/actual/set";
// stable required for `Set` ES features and features from web standards
// (DOM collections iterator in this case):
import "core-js/stable/set";
// only stable ES features required for `Set`:
import "core-js/es/set";
// the same without global namespace pollution:
import Set from '@core-js/pure/full/set';
import Set from '@core-js/pure/actual/set';
import Set from '@core-js/pure/stable/set';
import Set from '@core-js/pure/es/set';

// if you want to polyfill just the required methods:
import "core-js/full/set/intersection";
import "core-js/actual/array/find-last";
import "core-js/stable/queue-microtask";
import "core-js/es/array/from";

// polyfill async iterator helpers proposal:
import "core-js/proposals/async-iterator-helpers";
// polyfill all stage 2+ proposals:
import "core-js/stage/2";
```

> [!TIP]
> The usage of the `/actual/` namespace is recommended since it includes all actual JavaScript features and does not include unstable early-stage proposals that are available mainly for experiments.

> [!WARNING]
> - The `modules` path is an internal API, does not inject all required dependencies and can be changed in minor or patch releases. Use it only for a custom build and/or if you know what you are doing.
> - If you use `core-js` with the extension of native objects, recommended to load all `core-js` modules at the top of the entry point of your application, otherwise, you can have conflicts.
>   - For example, Google Maps uses its own `Symbol.iterator`, conflicting with `Array.from`, `URLSearchParams` and / or something else from `core-js`, see [related issues](https://github.com/search?q=repo%3Azloirock%2Fcore-js+Google+Maps&type=issues).
>   - Such conflicts are also resolvable by discovering and manually adding each conflicting entry from `core-js`.
> - `core-js` is extremely modular and uses a lot of very tiny modules, because of that, for usage in browsers, bundle up `core-js` instead of using a loader for each file; otherwise, you will have hundreds of requests.

#### CommonJS and prototype methods without global namespace pollution[⬆](#index)
In the `pure` version, we can't pollute prototypes of native constructors. Because of that, prototype methods are transformed into static methods, like in the examples above. But with transpilers, we can use one more trick - [bind operator and prototype methods](https://github.com/tc39/proposal-bind-operator). For this case, there are `/prototype/` entry points. Example:
```ts
import fill from '@core-js/pure/actual/array/prototype/fill';
import findIndex from '@core-js/pure/actual/array/prototype/find-index';

Array(10)::fill(0).map((a, b) => b * b)::findIndex(it => it && !(it % 8)); // => 4
```

> [!WARNING]
> The bind operator is an early-stage ECMAScript proposal and usage of this syntax can be dangerous.

### Babel[⬆](#index)

`core-js` is integrated with `babel` and is the base for polyfilling-related `babel` features:

> [!NOTE]
> `useBuiltIns` and `corejs` options described below are available only in Babel 7; in Babel 8, they were replaced with [`babel-plugin-polyfill-corejs3`](#babel-plugin-polyfill-corejs3).

#### `@babel/polyfill`[⬆](#index)

[`@babel/polyfill`](https://babeljs.io/docs/babel-polyfill) [**IS** just the import of stable `core-js` features and `regenerator-runtime`](https://github.com/babel/babel/blob/c8bb4500326700e7dc68ce8c4b90b6482c48d82f/packages/babel-polyfill/src/index.js) for generators and async functions, so loading `@babel/polyfill` means loading the global version of `core-js` without ES proposals.

Now it's deprecated in favor of separate inclusion of required parts of `core-js` and `regenerator-runtime` and, for backward compatibility, `@babel/polyfill` is still based on `core-js@2`.

As a full equivalent of `@babel/polyfill`, you can use the following:
```js
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

#### `@babel/preset-env`[⬆](#index)

[`@babel/preset-env`](https://github.com/babel/babel/tree/master/packages/babel-preset-env) has `useBuiltIns` option, which optimizes the use of the global version of `core-js`. With `useBuiltIns` option, you should also set `corejs` option to the used version of `core-js`, like `corejs: '4.1'`.

> [!IMPORTANT]
> It is recommended to specify the used minor `core-js` version, like `corejs: '4.1'`, instead of `corejs: 4`, since with `corejs: 4`, modules added in minor `core-js` releases will not be injected.

---

- `useBuiltIns: 'entry'` replaces imports of `core-js` with imports of only the modules required for a target environment. So, for example,
```js
import 'core-js/stable';
```
with `chrome 71` target will be replaced just to:
```js
import 'core-js/modules/es.array.unscopables.flat';
import 'core-js/modules/es.array.unscopables.flat-map';
import 'core-js/modules/es.object.from-entries';
import 'core-js/modules/web.immediate';
// ...and the rest of the modules not yet supported by Chrome 71
```
It works for all entry points of global version of `core-js` and their combinations, for example for
```js
import 'core-js/es';
import 'core-js/proposals/set-methods';
import 'core-js/full/set/map';
```
with `chrome 71` target you will have as the result:
```js
import 'core-js/modules/es.array.unscopables.flat';
import 'core-js/modules/es.array.unscopables.flat-map';
import 'core-js/modules/es.object.from-entries';
import 'core-js/modules/es.set.difference';
import 'core-js/modules/es.set.intersection';
import 'core-js/modules/es.set.is-disjoint-from';
import 'core-js/modules/es.set.is-subset-of';
import 'core-js/modules/es.set.is-superset-of';
import 'core-js/modules/es.set.symmetric-difference';
import 'core-js/modules/es.set.union';
import 'core-js/modules/esnext.set.map';
// ...and the rest of the modules not yet supported by Chrome 71
```

- `useBuiltIns: 'usage'` adds to the top of each file imports of polyfills for features used in this file and not supported by target environments, so for:
```js
// first file:
let set = new Set([1, 2, 3]);
```
```js
// second file:
let array = Array.of(1, 2, 3);
```
if the target contains an old environment like `IE 11` we will have something like:
```js
// first file:
import 'core-js/modules/es.array.iterator';
import 'core-js/modules/es.object.to-string';
import 'core-js/modules/es.set.constructor';

var set = new Set([1, 2, 3]);
```
```js
// second file:
import 'core-js/modules/es.array.of';

var array = Array.of(1, 2, 3);
```

By default, `@babel/preset-env` with `useBuiltIns: 'usage'` option only polyfills stable features, but you can enable polyfilling of proposals by the `proposals` option, as `corejs: { version: '4.0', proposals: true }`.

> [!IMPORTANT]
> In the case of `useBuiltIns: 'usage'`, you should not add `core-js` imports by yourself, they will be added automatically.

#### `@babel/runtime`[⬆](#index)

[`@babel/plugin-transform-runtime`](https://babeljs.io/docs/babel-plugin-transform-runtime) with `corejs: 4` option simplifies work with the `@core-js/pure`. It automatically replaces the usage of modern features from the JS standard library to imports from the version of `core-js` without global namespace pollution, so instead of:

```js
import from from '@core-js/pure/stable/array/from';
import flat from '@core-js/pure/stable/array/flat';
import Set from '@core-js/pure/stable/set';
import Promise from '@core-js/pure/stable/promise';

from(new Set([1, 2, 3, 2, 1]));
flat([1, [2, 3], [4, [5]]], 2);
Promise.resolve(32).then(x => console.log(x));
```
you can write just:
```js
Array.from(new Set([1, 2, 3, 2, 1]));
[1, [2, 3], [4, [5]]].flat(2);
Promise.resolve(32).then(x => console.log(x));
```

By default, `@babel/plugin-transform-runtime` only polyfills stable features, but like in `@babel/preset-env`, you can enable polyfilling of proposals by `proposals` option, as `corejs: { version: 4, proposals: true }`.

> [!WARNING]
> If you use `@babel/preset-env` and `@babel/plugin-transform-runtime` together, use `corejs` option only in one place since it's duplicate functionality and will cause conflicts.

#### `babel-plugin-polyfill-corejs3`[⬆](#index)

[`babel-plugin-polyfill-corejs3`](https://github.com/babel/babel-polyfills/tree/main/packages/babel-plugin-polyfill-corejs3) is a `babel` plugin for injection of `core-js` polyfills. In Babel 8, `useBuiltIns` and `corejs` options were removed from `@babel/preset-env` and `@babel/plugin-transform-runtime` in favor of this plugin; it also works with Babel 7. It has 3 methods: `entry-global` (like `useBuiltIns: 'entry'`), `usage-global` (like `useBuiltIns: 'usage'`) and `usage-pure` (like `@babel/plugin-transform-runtime` with `corejs: 3` option). Like with `corejs` option, it's recommended to specify the used minor `core-js` version by `version` option, and polyfilling of proposals can be enabled by `proposals: true` option. Example of configuration in `babel.config.json`:
```json
{
  "plugins": [["polyfill-corejs3", { "method": "usage-global", "version": "3.51" }]]
}
```

### swc[⬆](#index)

Fast JavaScript transpiler `swc` [contains integration with `core-js`](https://swc.rs/docs/configuration/supported-browsers), that optimizes work with the global version of `core-js`. [Like `@babel/preset-env`](#babelpreset-env), it has 2 modes: `usage` and `entry`, but `usage` mode still works not so well as in `babel`. Example of configuration in `.swcrc`:
```json
{
  "env": {
    "targets": "> 0.25%, not dead",
    "mode": "entry",
    "coreJs": "4.0"
  }
}
```

### Custom build[⬆](#index)

In some cases, it could be useful to exclude some `core-js` features or to generate a polyfill for target engines. You can use the [`@core-js/builder`](/packages/core-js-builder) package for that.

## Supported engines and compatibility data[⬆](#index)

`core-js` tries to support all possible JS engines and environments with ES3 support. Some features have a higher lower bar - for example, *some* accessors can properly work only from ES5, promises require a way to set a microtask or a task, etc.

However, I have no possibility to test `core-js` absolutely everywhere - for example, testing in IE7- and some other ancient engines was stopped. You can see the list of definitely supported engines in the compatibility table at the link below. [Write](https://github.com/zloirock/core-js/issues) if you have issues or questions with the support of any engine.

The `core-js` project provides (as the [`@core-js/compat`](/packages/core-js-compat) package) all required data about the necessity of `core-js` modules, entry points, and tools to work with it - it's useful for integration with tools like `babel` or `swc`. If you want to help, you could take a look at the related section of [`CONTRIBUTING.md`](/CONTRIBUTING.md#how-to-update-core-js-compat-data). The visualization of compatibility data and the browser tests runner is available [here](http://zloirock.github.io/core-js/master/compat/), the example:

![compat-table](https://user-images.githubusercontent.com/2213682/217452234-ccdcfc5a-c7d3-40d1-ab3f-86902315b8c3.png)

## Features:[⬆](#index)
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)
```

### ECMAScript[⬆](#index)
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es
```
#### ECMAScript: Object[⬆](#index)
Modules [`es.object.assign`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.assign.js), [`es.object.define-getter`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.define-getter.js), [`es.object.define-setter`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.define-setter.js), [`es.object.entries`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.entries.js), [`es.object.freeze`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.freeze.js), [`es.object.from-entries`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.from-entries.js), [`es.object.get-own-property-descriptor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.get-own-property-descriptor.js), [`es.object.get-own-property-descriptors`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.get-own-property-descriptors.js), [`es.object.get-own-property-names`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.get-own-property-names.js), [`es.object.get-prototype-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.get-prototype-of.js), [`es.object.group-by`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.group-by.js), [`es.object.has-own`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.has-own.js), [`es.object.is`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.is.js), [`es.object.is-extensible`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.is-extensible.js), [`es.object.is-frozen`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.is-frozen.js), [`es.object.is-sealed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.is-sealed.js), [`es.object.keys`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.keys.js), [`es.object.lookup-setter`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.lookup-setter.js), [`es.object.lookup-getter`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.lookup-getter.js), [`es.object.prevent-extensions`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.prevent-extensions.js), [`es.object.proto`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.proto.js), [`es.object.to-string`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.to-string.js), [`es.object.seal`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.seal.js), [`es.object.set-prototype-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.set-prototype-of.js), [`es.object.values`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.values.js).

```ts
class Object {
  toString(): string; // ES2015+ fix: @@toStringTag support
  __defineGetter__(property: PropertyKey, getter: Function): void;
  __defineSetter__(property: PropertyKey, setter: Function): void;
  __lookupGetter__(property: PropertyKey): Function | void;
  __lookupSetter__(property: PropertyKey): Function | void;
  __proto__: Object | null;
  static assign(target: Object, ...sources: Array<Object>): Object;
  static create(prototype: Object | null, properties?: { [property: PropertyKey]: PropertyDescriptor }): Object;
  static defineProperties(object: Object, properties: { [property: PropertyKey]: PropertyDescriptor }): Object;
  static defineProperty(object: Object, property: PropertyKey, attributes: PropertyDescriptor): Object;
  static entries(object: Object): Array<[string, mixed]>;
  static freeze(object: any): any;
  static fromEntries(iterable: Iterable<[key, value]>): Object;
  static getOwnPropertyDescriptor(object: any, property: PropertyKey): PropertyDescriptor | void;
  static getOwnPropertyDescriptors(object: any): { [property: PropertyKey]: PropertyDescriptor };
  static getOwnPropertyNames(object: any): Array<string>;
  static getPrototypeOf(object: any): Object | null;
  static groupBy(items: Iterable, callbackfn: (value: any, index: number) => key): { [key]: Array<mixed> };
  static hasOwn(object: object, key: PropertyKey): boolean;
  static is(value1: any, value2: any): boolean;
  static isExtensible(object: any): boolean;
  static isFrozen(object: any): boolean;
  static isSealed(object: any): boolean;
  static keys(object: any): Array<string>;
  static preventExtensions(object: any): any;
  static seal(object: any): any;
  static setPrototypeOf(target: any, prototype: Object | null): any;
  static values(object: any): Array<mixed>;
}
```
[*CommonJS entry points:*](#commonjs-api)
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
core-js(-pure)/es|stable|actual|full/object/group-by
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
*Examples*:
```js
let foo = { q: 1, w: 2 };
let bar = { e: 3, r: 4 };
let baz = { t: 5, y: 6 };
Object.assign(foo, bar, baz); // => foo = { q: 1, w: 2, e: 3, r: 4, t: 5, y: 6 }

Object.is(NaN, NaN); // => true
Object.is(0, -0);    // => false
Object.is(42, 42);   // => true
Object.is(42, '42'); // => false

function Parent() { /* empty */ }
function Child() { /* empty */ }
Object.setPrototypeOf(Child.prototype, Parent.prototype);
new Child() instanceof Child;  // => true
new Child() instanceof Parent; // => true

({
  [Symbol.toStringTag]: 'Foo',
}).toString(); // => '[object Foo]'

Object.keys('qwe'); // => ['0', '1', '2']
Object.getPrototypeOf('qwe') === String.prototype; // => true

Object.values({ a: 1, b: 2, c: 3 });  // => [1, 2, 3]
Object.entries({ a: 1, b: 2, c: 3 }); // => [['a', 1], ['b', 2], ['c', 3]]

for (let [key, value] of Object.entries({ a: 1, b: 2, c: 3 })) {
  console.log(key);   // -> 'a', 'b', 'c'
  console.log(value); // -> 1, 2, 3
}

// Shallow object cloning with prototype and descriptors:
let copy = Object.create(Object.getPrototypeOf(object), Object.getOwnPropertyDescriptors(object));
// Mixin:
Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));

const map = new Map([['a', 1], ['b', 2]]);
Object.fromEntries(map); // => { a: 1, b: 2 }

class Unit {
  constructor(id) {
    this.id = id;
  }
  toString() {
    return `unit${ this.id }`;
  }
}

const units = new Set([new Unit(101), new Unit(102)]);

Object.fromEntries(units.entries()); // => { unit101: Unit { id: 101 }, unit102: Unit { id: 102 } }

Object.hasOwn({ foo: 42 }, 'foo'); // => true
Object.hasOwn({ foo: 42 }, 'bar'); // => false
Object.hasOwn({}, 'toString');     // => false

Object.groupBy([1, 2, 3, 4, 5], it => it % 2); // => { 1: [1, 3, 5], 0: [2, 4] }
```

#### ECMAScript: Function[⬆](#index)
Modules [`es.function.name`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.function.name.js), [`es.function.has-instance`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.function.has-instance.js).
```ts
class Function {
  name: string;
  @@hasInstance(value: any): boolean;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/es|stable|actual|full/function
core-js(-pure)/es|stable|actual|full/function/virtual
core-js/es|stable|actual|full/function/name
```
[*Examples*](https://core-js.io/playground#code=%28function+foo%28%29+%7B+%2F%2A+empty+%2A%2F+%7D%29.name%3B+%2F%2F+%3D%3E+%27foo%27%0A%0Aconsole.log.bind%28console%2C+42%29%2843%29%3B+%2F%2F+-%3E+42+43):
```js
(function foo() { /* empty */ }).name; // => 'foo'
```

#### ECMAScript: Error[⬆](#index)
Modules [`es.aggregate-error.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.aggregate-error.constructor.js), [`es.aggregate-error.cause`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.aggregate-error.cause.js), [`es.error.cause`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.error.cause.js), [`es.error.is-error`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.error.is-error.js), [`es.suppressed-error.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.suppressed-error.constructor.js), [`es.error.to-string`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.error.to-string.js).
```ts
class Error {
  static isError(value: any): boolean;
  constructor(message?: string, { cause: any }?): %Error%;
}

class [
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError,
  WebAssembly.CompileError,
  WebAssembly.LinkError,
  WebAssembly.RuntimeError,
] extends Error {
  constructor(message?: string, { cause: any }?): %Error%;
}

class AggregateError extends Error {
  constructor(errors: Iterable, message?: string, { cause: any }?): AggregateError;
  errors: Array<any>;
  message: string;
  cause: any;
}

class SuppressedError extends Error {
  constructor(error: any, suppressed: any, message?: string): SuppressedError;
  error: any;
  suppressed: any;
  message: string;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/es|stable|actual|full/error
core-js/es|stable|actual|full/error/constructor
core-js(-pure)/es|stable|actual|full/error/is-error
core-js(-pure)/es|stable|actual|full/aggregate-error
core-js(-pure)/es|stable|actual|full/suppressed-error
```
[*Examples*](https://core-js.io/playground#code=const+error1+%3D+new+TypeError%28%27Error+1%27%29%3B%0Aconst+error2+%3D+new+TypeError%28%27Error+2%27%29%3B%0Aconst+aggregate+%3D+new+AggregateError%28%5Berror1%2C+error2%5D%2C+%27Collected+errors%27%29%3B%0Aaggregate.errors%5B0%5D+%3D%3D%3D+error1%3B+%2F%2F+%3D%3E+true%0Aaggregate.errors%5B1%5D+%3D%3D%3D+error2%3B+%2F%2F+%3D%3E+true%0A%0Aconst+cause+%3D+new+TypeError%28%27Something+wrong%27%29%3B%0Aconst+error+%3D+new+TypeError%28%27Here+is+what+went+wrong%27%2C+%7B+cause+%7D%29%3B%0Aerror.cause+%3D%3D%3D+cause%3B+%2F%2F+%3D%3E+true%0A%0AError.prototype.toString.call%28%7B+message%3A+1%2C+name%3A+2+%7D%29+%3D%3D%3D+%272%3A+1%27%3B+%2F%2F+%3D%3E+true):
```js
const error1 = new TypeError('Error 1');
const error2 = new TypeError('Error 2');
const aggregate = new AggregateError([error1, error2], 'Collected errors');
aggregate.errors[0] === error1; // => true
aggregate.errors[1] === error2; // => true

const cause = new TypeError('Something wrong');
const error = new TypeError('Here is what went wrong', { cause });
error.cause === cause; // => true
```

[*Examples*](https://core-js.io/playground#code=Error.isError%28new+Error%28%27error%27%29%29%3B+%2F%2F+%3D%3E+true%0AError.isError%28new+TypeError%28%27error%27%29%29%3B+%2F%2F+%3D%3E+true%0AError.isError%28new+DOMException%28%27error%27%29%29%3B+%2F%2F+%3D%3E+true%0A%0AError.isError%28null%29%3B+%2F%2F+%3D%3E+false%0AError.isError%28%7B%7D%29%3B+%2F%2F+%3D%3E+false%0AError.isError%28Object.create%28Error.prototype%29%29%3B+%2F%2F+%3D%3E+false):
```js
Error.isError(new Error('error')); // => true
Error.isError(new TypeError('error')); // => true
Error.isError(new DOMException('error')); // => true

Error.isError(null); // => false
Error.isError({}); // => false
Error.isError(Object.create(Error.prototype)); // => false
```

> [!WARNING]
> We have no bulletproof way to polyfill this `Error.isError` / check if the object is an error, so it's a rather naive implementation.

#### ECMAScript: Array[⬆](#index)
Modules [`es.array.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.from.js), [`es.array.from-async`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.from-async.js), [`es.array.of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.of.js), [`es.array.species`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.species.js), [`es.array.concat`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.concat.js), [`es.array.copy-within`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.copy-within.js), [`es.array.fill`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.fill.js), [`es.array.find`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.find.js), [`es.array.find-index`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.find-index.js), [`es.array.find-last`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.find-last.js), [`es.array.find-last-index`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.find-last-index.js), [`es.array.iterator`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.iterator.js), [`es.array.includes`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.includes.js), [`es.array.push`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.push.js), [`es.array.slice`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.slice.js), [`es.array.splice`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.splice.js), [`es.array.join`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.join.js), [`es.array.unshift`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.unshift.js), [`es.array.index-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.index-of.js), [`es.array.last-index-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.last-index-of.js), [`es.array.map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.map.js), [`es.array.filter`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.filter.js), [`es.array.reduce`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.reduce.js), [`es.array.reduce-right`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.reduce-right.js), [`es.array.reverse`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.reverse.js), [`es.array.sort`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.sort.js), [`es.array.flat`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.flat.js), [`es.array.flat-map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.flat-map.js), [`es.array.unscopables.flat`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.unscopables.flat.js), [`es.array.unscopables.flat-map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.unscopables.flat-map.js), [`es.array.at`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.at.js), [`es.array.to-reversed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.to-reversed.js), [`es.array.to-sorted`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.to-sorted.js), [`es.array.to-spliced`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.to-spliced.js), [`es.array.with`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.with.js).
```ts
class Array {
  at(index: int): any;
  concat(...args: Array<mixed>): Array<mixed>; // with added support for @@isConcatSpreadable and @@species
  copyWithin(target: number, start: number, end?: number): this;
  entries(): Iterator<[index, value]>;
  fill(value: any, start?: number, end?: number): this;
  filter(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): Array<mixed>; // with added support for @@species
  find(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): any;
  findIndex(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): number;
  findLast(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): any;
  findLastIndex(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): number;
  flat(depthArg?: number = 1): Array<mixed>;
  flatMap(mapFn: (value: any, index: number, target: any) => any, thisArg?: any): Array<mixed>;
  includes(searchElement: any, from?: number): boolean;
  indexOf(searchElement: any, from?: number): number;
  join(separator: string = ','): string;
  keys(): Iterator<index>;
  lastIndexOf(searchElement: any, from?: number): number;
  map(mapFn: (value: any, index: number, target: any) => any, thisArg?: any): Array<mixed>; // with added support for @@species
  push(...args: Array<mixed>): uint;
  reduce(callbackfn: (memo: any, value: any, index: number, target: any) => any, initialValue?: any): any;
  reduceRight(callbackfn: (memo: any, value: any, index: number, target: any) => any, initialValue?: any): any;
  reverse(): this; // Safari 12.0 bug fix
  slice(start?: number, end?: number): Array<mixed>; // with added support for @@species
  splice(start?: number, deleteCount?: number, ...items: Array<mixed>): Array<mixed>; // with added support for @@species
  sort(comparefn?: (a: any, b: any) => number): this; // with modern behavior like stable sort
  toReversed(): Array<mixed>;
  toSpliced(start?: number, deleteCount?: number, ...items: Array<mixed>): Array<mixed>;
  toSorted(comparefn?: (a: any, b: any) => number): Array<mixed>;
  unshift(...args: Array<mixed>): uint;
  values(): Iterator<value>;
  with(index: int, value: any): Array<mixed>;
  @@iterator(): Iterator<value>;
  @@unscopables: { [newMethodNames: string]: true };
  static from(items: Iterable | ArrayLike, mapFn?: (value: any, index: number) => any, thisArg?: any): Array<mixed>;
  static fromAsync(asyncItems: AsyncIterable | Iterable | ArrayLike, mapFn?: (value: any, index: number) => any, thisArg?: any): Promise<Array<mixed>>;
  static of(...args: Array<mixed>): Array<mixed>;
  static readonly attribute @@species: this;
}

class Arguments {
  @@iterator(): Iterator<value>; // available only in core-js methods
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/array
core-js(-pure)/es|stable|actual|full/array/virtual
core-js(-pure)/es|stable|actual|full/array/from
core-js(-pure)/es|stable|actual|full/array/from-async
core-js(-pure)/es|stable|actual|full/array/of
core-js(-pure)/es|stable|actual|full/array(/prototype)/at
core-js(-pure)/es|stable|actual|full/array(/prototype)/concat
core-js(-pure)/es|stable|actual|full/array(/prototype)/copy-within
core-js(-pure)/es|stable|actual|full/array(/prototype)/entries
core-js(-pure)/es|stable|actual|full/array(/prototype)/fill
core-js(-pure)/es|stable|actual|full/array(/prototype)/filter
core-js(-pure)/es|stable|actual|full/array(/prototype)/find
core-js(-pure)/es|stable|actual|full/array(/prototype)/find-index
core-js(-pure)/es|stable|actual|full/array(/prototype)/find-last
core-js(-pure)/es|stable|actual|full/array(/prototype)/find-last-index
core-js(-pure)/es|stable|actual|full/array(/prototype)/flat
core-js(-pure)/es|stable|actual|full/array(/prototype)/flat-map
core-js(-pure)/es|stable|actual|full/array(/prototype)/includes
core-js(-pure)/es|stable|actual|full/array(/prototype)/index-of
core-js(-pure)/es|stable|actual|full/array(/prototype)/iterator
core-js(-pure)/es|stable|actual|full/array(/prototype)/join
core-js(-pure)/es|stable|actual|full/array(/prototype)/keys
core-js(-pure)/es|stable|actual|full/array(/prototype)/last-index-of
core-js(-pure)/es|stable|actual|full/array(/prototype)/map
core-js(-pure)/es|stable|actual|full/array(/prototype)/push
core-js(-pure)/es|stable|actual|full/array(/prototype)/reduce
core-js(-pure)/es|stable|actual|full/array(/prototype)/reduce-right
core-js(-pure)/es|stable|actual|full/array(/prototype)/reverse
core-js(-pure)/es|stable|actual|full/array(/prototype)/slice
core-js(-pure)/es|stable|actual|full/array(/prototype)/sort
core-js(-pure)/es|stable|actual|full/array(/prototype)/splice
core-js(-pure)/es|stable|actual|full/array(/prototype)/to-reversed
core-js(-pure)/es|stable|actual|full/array(/prototype)/to-sorted
core-js(-pure)/es|stable|actual|full/array(/prototype)/to-spliced
core-js(-pure)/es|stable|actual|full/array(/prototype)/unshift
core-js(-pure)/es|stable|actual|full/array(/prototype)/values
core-js(-pure)/es|stable|actual|full/array(/prototype)/with
```
[*Examples*](https://core-js.io/playground#code=Array.from%28new+Set%28%5B1%2C+2%2C+3%2C+2%2C+1%5D%29%29%3B++++++++%2F%2F+%3D%3E+%5B1%2C+2%2C+3%5D%0AArray.from%28%7B+0%3A+1%2C+1%3A+2%2C+2%3A+3%2C+length%3A+3+%7D%29%3B+%2F%2F+%3D%3E+%5B1%2C+2%2C+3%5D%0AArray.from%28%27123%27%2C+Number%29%3B+++++++++++++++++++%2F%2F+%3D%3E+%5B1%2C+2%2C+3%5D%0AArray.from%28%27123%27%2C+it+%3D%3E+it+%2A%2A+2%29%3B++++++++++++%2F%2F+%3D%3E+%5B1%2C+4%2C+9%5D%0A%0AArray.of%281%29%3B+++++++%2F%2F+%3D%3E+%5B1%5D%0AArray.of%281%2C+2%2C+3%29%3B+%2F%2F+%3D%3E+%5B1%2C+2%2C+3%5D%0A%0Alet+array+%3D+%5B%27a%27%2C+%27b%27%2C+%27c%27%5D%3B%0A%0Afor+%28let+value+of+array%29+console.log%28value%29%3B++++++++++%2F%2F+-%3E+%27a%27%2C+%27b%27%2C+%27c%27%0Afor+%28let+value+of+array.values%28%29%29+console.log%28value%29%3B+%2F%2F+-%3E+%27a%27%2C+%27b%27%2C+%27c%27%0Afor+%28let+key+of+array.keys%28%29%29+console.log%28key%29%3B+++++++%2F%2F+-%3E+0%2C+1%2C+2%0Afor+%28let+%5Bkey%2C+value%5D+of+array.entries%28%29%29+%7B%0A++console.log%28key%29%3B+++++++++++++++++++++++++++++++++++%2F%2F+-%3E+0%2C+1%2C+2%0A++console.log%28value%29%3B+++++++++++++++++++++++++++++++++%2F%2F+-%3E+%27a%27%2C+%27b%27%2C+%27c%27%0A%7D%0A%0Afunction+isOdd%28value%29+%7B%0A++return+value+%25+2%3B%0A%7D%0A%5B4%2C+8%2C+15%2C+16%2C+23%2C+42%5D.find%28isOdd%29%3B++++++%2F%2F+%3D%3E+15%0A%5B4%2C+8%2C+15%2C+16%2C+23%2C+42%5D.findIndex%28isOdd%29%3B+%2F%2F+%3D%3E+2%0A%5B1%2C+2%2C+3%2C+4%5D.findLast%28isOdd%29%3B++++++++++++%2F%2F+%3D%3E+3%0A%5B1%2C+2%2C+3%2C+4%5D.findLastIndex%28isOdd%29%3B+++++++%2F%2F+%3D%3E+2%0A%0AArray%285%29.fill%2842%29%3B+%2F%2F+%3D%3E+%5B42%2C+42%2C+42%2C+42%2C+42%5D%0A%0A%5B1%2C+2%2C+3%2C+4%2C+5%5D.copyWithin%280%2C+3%29%3B+%2F%2F+%3D%3E+%5B4%2C+5%2C+3%2C+4%2C+5%5D%0A%0A%5B1%2C+2%2C+3%5D.includes%282%29%3B++++++++%2F%2F+%3D%3E+true%0A%5B1%2C+2%2C+3%5D.includes%284%29%3B++++++++%2F%2F+%3D%3E+false%0A%5B1%2C+2%2C+3%5D.includes%282%2C+2%29%3B+++++%2F%2F+%3D%3E+false%0A%0A%5BNaN%5D.indexOf%28NaN%29%3B+++++++++++%2F%2F+%3D%3E+-1%0A%5BNaN%5D.includes%28NaN%29%3B++++++++++%2F%2F+%3D%3E+true%0AArray%281%29.indexOf%28undefined%29%3B++%2F%2F+%3D%3E+-1%0AArray%281%29.includes%28undefined%29%3B+%2F%2F+%3D%3E+true%0A%0A%5B1%2C+%5B2%2C+3%5D%2C+%5B4%2C+5%5D%5D.flat%28%29%3B++++%2F%2F+%3D%3E+%5B1%2C+2%2C+3%2C+4%2C+5%5D%0A%5B1%2C+%5B2%2C+%5B3%2C+%5B4%5D%5D%5D%2C+5%5D.flat%28%29%3B++%2F%2F+%3D%3E+%5B1%2C+2%2C+%5B3%2C+%5B4%5D%5D%2C+5%5D%0A%5B1%2C+%5B2%2C+%5B3%2C+%5B4%5D%5D%5D%2C+5%5D.flat%283%29%3B+%2F%2F+%3D%3E+%5B1%2C+2%2C+3%2C+4%2C+5%5D%0A%0A%5B%7B+a%3A+1%2C+b%3A+2+%7D%2C+%7B+a%3A+3%2C+b%3A+4+%7D%2C+%7B+a%3A+5%2C+b%3A+6+%7D%5D.flatMap%28it+%3D%3E+%5Bit.a%2C+it.b%5D%29%3B+%2F%2F+%3D%3E+%5B1%2C+2%2C+3%2C+4%2C+5%2C+6%5D%0A%0A%5B1%2C+2%2C+3%5D.at%281%29%3B++%2F%2F+%3D%3E+2%0A%5B1%2C+2%2C+3%5D.at%28-1%29%3B+%2F%2F+%3D%3E+3%0A%0Aconst+sequence+%3D+%5B1%2C+2%2C+3%5D%3B%0Asequence.toReversed%28%29%3B+%2F%2F+%3D%3E+%5B3%2C+2%2C+1%5D%0Asequence%3B+%2F%2F+%3D%3E+%5B1%2C+2%2C+3%5D%0A%0Aconst+initialArray+%3D+%5B1%2C+2%2C+3%2C+4%5D%3B%0AinitialArray.toSpliced%281%2C+2%2C+5%2C+6%2C+7%29%3B+%2F%2F+%3D%3E+%5B1%2C+5%2C+6%2C+7%2C+4%5D%0AinitialArray%3B+%2F%2F+%3D%3E+%5B1%2C+2%2C+3%2C+4%5D%0A%0Aconst+outOfOrder+%3D+%5B3%2C+1%2C+2%5D%3B%0AoutOfOrder.toSorted%28%29%3B+%2F%2F+%3D%3E+%5B1%2C+2%2C+3%5D%0AoutOfOrder%3B+%2F%2F+%3D%3E+%5B3%2C+1%2C+2%5D%0A%0Aconst+correctionNeeded+%3D+%5B1%2C+1%2C+3%5D%3B%0AcorrectionNeeded.with%281%2C+2%29%3B+%2F%2F+%3D%3E+%5B1%2C+2%2C+3%5D%0AcorrectionNeeded%3B+%2F%2F+%3D%3E+%5B1%2C+1%2C+3%5D):
```js
Array.from(new Set([1, 2, 3, 2, 1]));        // => [1, 2, 3]
Array.from({ 0: 1, 1: 2, 2: 3, length: 3 }); // => [1, 2, 3]
Array.from('123', Number);                   // => [1, 2, 3]
Array.from('123', it => it ** 2);            // => [1, 4, 9]

Array.of(1);       // => [1]
Array.of(1, 2, 3); // => [1, 2, 3]

let array = ['a', 'b', 'c'];

for (let value of array) console.log(value);          // -> 'a', 'b', 'c'
for (let value of array.values()) console.log(value); // -> 'a', 'b', 'c'
for (let key of array.keys()) console.log(key);       // -> 0, 1, 2
for (let [key, value] of array.entries()) {
  console.log(key);                                   // -> 0, 1, 2
  console.log(value);                                 // -> 'a', 'b', 'c'
}

function isOdd(value) {
  return value % 2;
}
[4, 8, 15, 16, 23, 42].find(isOdd);      // => 15
[4, 8, 15, 16, 23, 42].findIndex(isOdd); // => 2
[1, 2, 3, 4].findLast(isOdd);            // => 3
[1, 2, 3, 4].findLastIndex(isOdd);       // => 2

Array(5).fill(42); // => [42, 42, 42, 42, 42]

[1, 2, 3, 4, 5].copyWithin(0, 3); // => [4, 5, 3, 4, 5]

[1, 2, 3].includes(2);        // => true
[1, 2, 3].includes(4);        // => false
[1, 2, 3].includes(2, 2);     // => false

[NaN].indexOf(NaN);           // => -1
[NaN].includes(NaN);          // => true
Array(1).indexOf(undefined);  // => -1
Array(1).includes(undefined); // => true

[1, [2, 3], [4, 5]].flat();    // => [1, 2, 3, 4, 5]
[1, [2, [3, [4]]], 5].flat();  // => [1, 2, [3, [4]], 5]
[1, [2, [3, [4]]], 5].flat(3); // => [1, 2, 3, 4, 5]

[{ a: 1, b: 2 }, { a: 3, b: 4 }, { a: 5, b: 6 }].flatMap(it => [it.a, it.b]); // => [1, 2, 3, 4, 5, 6]

[1, 2, 3].at(1);  // => 2
[1, 2, 3].at(-1); // => 3

const sequence = [1, 2, 3];
sequence.toReversed(); // => [3, 2, 1]
sequence; // => [1, 2, 3]

const initialArray = [1, 2, 3, 4];
initialArray.toSpliced(1, 2, 5, 6, 7); // => [1, 5, 6, 7, 4]
initialArray; // => [1, 2, 3, 4]

const outOfOrder = [3, 1, 2];
outOfOrder.toSorted(); // => [1, 2, 3]
outOfOrder; // => [3, 1, 2]

const correctionNeeded = [1, 1, 3];
correctionNeeded.with(1, 2); // => [1, 2, 3]
correctionNeeded; // => [1, 1, 3]
```

[*`Array.fromAsync` example*](https://core-js.io/playground#code=await+Array.fromAsync%28%28async+function+%2A+%28%29+%7B+yield+%2A+%5B1%2C+2%2C+3%5D%3B+%7D%29%28%29%2C+i+%3D%3E+i+%2A%2A+2%29%3B+%2F%2F+%3D%3E+%5B1%2C+4%2C+9%5D):
```js
await Array.fromAsync((async function * () { yield * [1, 2, 3]; })(), i => i ** 2); // => [1, 4, 9]
```

#### ECMAScript: Iterator[⬆](#index)
Modules [`es.iterator.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.constructor.js), [`es.iterator.chunks`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.chunks.js), [`es.iterator.concat`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.concat.js), [`es.iterator.dispose`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.dispose.js), [`es.iterator.drop`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.drop.js), [`es.iterator.every`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.every.js), [`es.iterator.filter`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.filter.js), [`es.iterator.find`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.find.js), [`es.iterator.flat-map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.flat-map.js), [`es.iterator.for-each`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.for-each.js), [`es.iterator.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.from.js), [`es.iterator.includes`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.includes.js), [`es.iterator.join`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.join.js), [`es.iterator.map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.map.js), [`es.iterator.reduce`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.reduce.js), [`es.iterator.some`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.some.js), [`es.iterator.take`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.take.js), [`es.iterator.to-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.to-array.js), [`es.iterator.windows`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.windows.js), [`es.iterator.zip`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.zip.js), [`es.iterator.zip-keyed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.zip-keyed.js).
```ts
class Iterator {
  static concat(...items: Array<IterableObject>): Iterator<any>;
  static from(iterable: Iterable<any> | Iterator<any>): Iterator<any>;
  static zip<T extends readonly Iterable<unknown>[]>(
    iterables: T,
    options?: {
      mode?: 'shortest' | 'longest' | 'strict';
      padding?: { [K in keyof T]?: T[K] extends Iterable<infer U> ? U : never };
    }
  ): Iterator<{ [K in keyof T]: T[K] extends Iterable<infer U> ? U : never }>;
  static zipKeyed<K extends PropertyKey, V extends Record<K, Iterable<unknown>>>(
    iterables: V,
    options?: {
      mode?: 'shortest' | 'longest' | 'strict';
      padding?: { [P in keyof V]?: V[P] extends Iterable<infer U> ? U : never };
    }
  ): Iterator<{ [P in keyof V]: V[P] extends Iterable<infer U> ? U : never }>;
  chunks(chunkSize: number): Iterator<any>;
  drop(limit: uint): Iterator<any>;
  every(callbackfn: (value: any, counter: uint) => boolean): boolean;
  filter(callbackfn: (value: any, counter: uint) => boolean): Iterator<any>;
  find(callbackfn: (value: any, counter: uint) => boolean): any;
  flatMap(callbackfn: (value: any, counter: uint) => Iterable<any> | Iterator<any>): Iterator<any>;
  forEach(callbackfn: (value: any, counter: uint) => void): void;
  includes(searchElement: any, skippedElements?: number): boolean;
  join(separator?: string): string;
  map(callbackfn: (value: any, counter: uint) => any): Iterator<any>;
  reduce(callbackfn: (memo: any, value: any, counter: uint) => any, initialValue?: any): any;
  some(callbackfn: (value: any, counter: uint) => boolean): boolean;
  take(limit: uint): Iterator<any>;
  toArray(): Array<any>;
  windows(windowSize: number, undersized?: 'only-full' | 'allow-partial' | undefined): Iterator<any>;
  @@dispose(): undefined;
  @@toStringTag: 'Iterator';
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/iterator
core-js(-pure)/es|stable|actual|full/iterator/chunks
core-js(-pure)/es|stable|actual|full/iterator/concat
core-js(-pure)/es|stable|actual|full/iterator/drop
core-js(-pure)/es|stable|actual|full/iterator/every
core-js(-pure)/es|stable|actual|full/iterator/filter
core-js(-pure)/es|stable|actual|full/iterator/find
core-js(-pure)/es|stable|actual|full/iterator/flat-map
core-js(-pure)/es|stable|actual|full/iterator/for-each
core-js(-pure)/es|stable|actual|full/iterator/from
core-js(-pure)/es|stable|actual|full/iterator/includes
core-js(-pure)/es|stable|actual|full/iterator/join
core-js(-pure)/es|stable|actual|full/iterator/map
core-js(-pure)/es|stable|actual|full/iterator/reduce
core-js(-pure)/es|stable|actual|full/iterator/some
core-js(-pure)/es|stable|actual|full/iterator/take
core-js(-pure)/es|stable|actual|full/iterator/to-array
core-js(-pure)/es|stable|actual|full/iterator/windows
core-js(-pure)/es|stable|actual|full/iterator/zip
core-js(-pure)/es|stable|actual|full/iterator/zip-keyed
```
[*Examples*](https://core-js.io/playground#code=%5B1%2C+2%2C+3%2C+4%2C+5%2C+6%2C+7%5D.values%28%29%0A++.drop%281%29%0A++.take%285%29%0A++.filter%28it+%3D%3E+it+%25+2%29%0A++.map%28it+%3D%3E+it+%2A%2A+2%29%0A++.toArray%28%29%3B+%2F%2F+%3D%3E+%5B9%2C+25%5D%0A%0AIterator.from%28%7B%0A++next%3A+%28%29+%3D%3E+%28%7B+done%3A+Math.random%28%29+%3E+0.9%2C+value%3A+Math.random%28%29+%2A+10+%7C+0+%7D%29%2C%0A%7D%29.toArray%28%29%3B+%2F%2F+%3D%3E+%5B7%2C+6%2C+3%2C+0%2C+2%2C+8%5D%0A%0AIterator.concat%28%5B0%2C+1%5D.values%28%29%2C+%5B2%2C+3%5D%2C+function+%2A+%28%29+%7B%0A++yield+4%3B%0A++yield+5%3B%0A%7D%28%29%29.toArray%28%29%3B+%2F%2F+%3D%3E+%5B0%2C+1%2C+2%2C+3%2C+4%2C+5%5D%0A%0AIterator.zip%28%5B%0A++%5B0%2C+1%2C+2%5D%2C%0A++%5B3%2C+4%2C+5%5D%2C%0A%5D%29.toArray%28%29%3B++%2F%2F+%3D%3E+%5B%5B0%2C+3%5D%2C+%5B1%2C+4%5D%2C+%5B2%2C+5%5D%5D%0A%0AIterator.zipKeyed%28%7B%0A++a%3A+%5B0%2C+1%2C+2%5D%2C%0A++b%3A+%5B3%2C+4%2C+5%2C+6%5D%2C%0A++c%3A+%5B7%2C+8%2C+9%5D%2C%0A%7D%2C+%7B%0A++mode%3A+%27longest%27%2C%0A++padding%3A+%7B+c%3A+10+%7D%2C%0A%7D%29.toArray%28%29%3B+%2F%2F+%3D%3E%0A%2F%2A%0A%5B%0A++%7B+a%3A+0%2C+++++++++b%3A+3%2C+c%3A+7++%7D%2C%0A++%7B+a%3A+1%2C+++++++++b%3A+4%2C+c%3A+8++%7D%2C%0A++%7B+a%3A+2%2C+++++++++b%3A+5%2C+c%3A+9++%7D%2C%0A++%7B+a%3A+undefined%2C+b%3A+6%2C+c%3A+10+%7D%2C%0A%5D%3B%0A+%2A%2F%0A%0Aconst+digits+%3D+%28%29+%3D%3E+%5B0%2C+1%2C+2%2C+3%2C+4%2C+5%2C+6%2C+7%2C+8%2C+9%5D.values%28%29%3B%0A%0AArray.from%28digits%28%29.chunks%282%29%29%3B++%2F%2F+%3D%3E+%5B%5B0%2C+1%5D%2C+%5B2%2C+3%5D%2C+%5B4%2C+5%5D%2C+%5B6%2C+7%5D%2C+%5B8%2C+9%5D%5D%0A%0AArray.from%28digits%28%29.windows%282%29%29%3B++%2F%2F+%3D%3E+%5B%5B0%2C+1%5D%2C+%5B1%2C+2%5D%2C+%5B2%2C+3%5D%2C+%5B3%2C+4%5D%2C+%5B4%2C+5%5D%2C+%5B5%2C+6%5D%2C+%5B6%2C+7%5D%2C+%5B7%2C+8%5D%2C+%5B8%2C+9%5D%5D%0A%0AArray.from%28%5B0%2C+1%5D.values%28%29.windows%283%2C+%27allow-partial%27%29%29%3B++%2F%2F+%3D%3E+%5B%5B0%2C+1%5D%5D%0A%0AArray.from%28%5B0%2C+1%5D.values%28%29.windows%283%29%29%3B++%2F%2F+%3D%3E+%5B%5D%0A%0A%5B1%2C+2%2C+3%5D.values%28%29.includes%282%29%3B+++++%2F%2F+%3D%3E+true%0A%5B1%2C+2%2C+3%5D.values%28%29.includes%284%29%3B+++++%2F%2F+%3D%3E+false%0A%5BNaN%5D.values%28%29.includes%28NaN%29%3B+++++++%2F%2F+%3D%3E+true%0A%5B1%2C+2%2C+3%5D.values%28%29.includes%283%2C+2%29%3B++%2F%2F+%3D%3E+true%0A%5B1%2C+2%2C+3%5D.values%28%29.includes%281%2C+1%29%3B++%2F%2F+%3D%3E+false%0A%0A%2F%2A+eslint-disable+unicorn%2Frequire-array-join-separator+--+example+%2A%2F%0A%5B1%2C+2%2C+3%5D.values%28%29.join%28%29%3B+++++%2F%2F+%3D%3E+%271%2C2%2C3%27%0A%5B1%2C+2%2C+3%5D.values%28%29.join%28%27-%27%29%3B++%2F%2F+%3D%3E+%271-2-3%27%0A%5B1%2C+null%2C+3%5D.values%28%29.join%28%29%3B++%2F%2F+%3D%3E+%271%2C%2C3%27%0A%2F%2A+eslint-enable+unicorn%2Frequire-array-join-separator+--+example+%2A%2F):
```js
[1, 2, 3, 4, 5, 6, 7].values()
  .drop(1)
  .take(5)
  .filter(it => it % 2)
  .map(it => it ** 2)
  .toArray(); // => [9, 25]

Iterator.from({
  next: () => ({ done: Math.random() > 0.9, value: Math.random() * 10 | 0 }),
}).toArray(); // => [7, 6, 3, 0, 2, 8]

Iterator.concat([0, 1].values(), [2, 3], function * () {
  yield 4;
  yield 5;
}()).toArray(); // => [0, 1, 2, 3, 4, 5]

Iterator.zip([
  [0, 1, 2],
  [3, 4, 5],
]).toArray();  // => [[0, 3], [1, 4], [2, 5]]

Iterator.zipKeyed({
  a: [0, 1, 2],
  b: [3, 4, 5, 6],
  c: [7, 8, 9],
}, {
  mode: 'longest',
  padding: { c: 10 },
}).toArray(); // =>
/*
[
  { a: 0,         b: 3, c: 7  },
  { a: 1,         b: 4, c: 8  },
  { a: 2,         b: 5, c: 9  },
  { a: undefined, b: 6, c: 10 },
];
 */

const digits = () => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].values();

Array.from(digits().chunks(2));  // => [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9]]

Array.from(digits().windows(2));  // => [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9]]

Array.from([0, 1].values().windows(3, 'allow-partial'));  // => [[0, 1]]

Array.from([0, 1].values().windows(3));  // => []

[1, 2, 3].values().includes(2);     // => true
[1, 2, 3].values().includes(4);     // => false
[NaN].values().includes(NaN);       // => true
[1, 2, 3].values().includes(3, 2);  // => true
[1, 2, 3].values().includes(1, 1);  // => false

/* eslint-disable unicorn/require-array-join-separator -- example */
[1, 2, 3].values().join();     // => '1,2,3'
[1, 2, 3].values().join('-');  // => '1-2-3'
[1, null, 3].values().join();  // => '1,,3'
/* eslint-enable unicorn/require-array-join-separator -- example */
```

> [!WARNING]
> - To prevent prototype pollution, in the `pure` version, new `%IteratorPrototype%` methods are not added to the real `%IteratorPrototype%`, they are available only on wrappers - instead of `[].values().map(fn)` use `Iterator.from([]).map(fn)`.

#### ECMAScript: String and RegExp[⬆](#index)
The main part of `String` features: modules [`es.string.from-code-point`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.from-code-point.js), [`es.string.raw`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.raw.js), [`es.string.iterator`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.iterator.js), [`es.string.split`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.split.js), [`es.string.code-point-at`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.code-point-at.js), [`es.string.ends-with`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.ends-with.js), [`es.string.includes`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.includes.js), [`es.string.repeat`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.repeat.js), [`es.string.pad-start`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.pad-start.js), [`es.string.pad-end`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.pad-end.js), [`es.string.starts-with`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.starts-with.js), [`es.string.trim`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.trim.js), [`es.string.trim-start`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.trim-start.js), [`es.string.trim-left`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.trim-left.js), [`es.string.trim-end`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.trim-end.js), [`es.string.trim-right`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.trim-right.js), [`es.string.match-all`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.match-all.js), [`es.string.replace-all`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.replace-all.js), [`es.string.at`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.at.js), [`es.string.is-well-formed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.is-well-formed.js), [`es.string.to-well-formed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.to-well-formed.js).

Added support for well-known [symbols](#ecmascript-symbol) `@@match`, `@@replace`, `@@search` and `@@split` and direct `.exec` calls to the related `String` methods, modules [`es.string.match`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.match.js), [`es.string.replace`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.replace.js), [`es.string.search`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.search.js) and [`es.string.split`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.split.js).

Annex B methods. Modules [`es.string.anchor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.anchor.js), [`es.string.big`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.big.js), [`es.string.blink`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.blink.js), [`es.string.bold`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.bold.js), [`es.string.fixed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.fixed.js), [`es.string.fontcolor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.fontcolor.js), [`es.string.fontsize`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.fontsize.js), [`es.string.italics`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.italics.js), [`es.string.link`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.link.js), [`es.string.small`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.small.js), [`es.string.strike`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.strike.js), [`es.string.sub`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.sub.js), [`es.string.sup`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.sup.js).

`RegExp` features: modules [`es.regexp.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.regexp.constructor.js), [`es.regexp.escape`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.regexp.escape.js), [`es.regexp.exec`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.regexp.exec.js), [`es.regexp.dot-all`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.regexp.dot-all.js), [`es.regexp.flags`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.regexp.flags.js), [`es.regexp.sticky`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.regexp.sticky.js), [`es.regexp.test`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.regexp.test.js) and [`es.regexp.to-string`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.regexp.to-string.js).
```ts
class String {
  static fromCodePoint(...codePoints: Array<number>): string;
  static raw({ raw: Array<string> }, ...substitutions: Array<string>): string;
  at(index: int): string | void;
  includes(searchString: string, position?: number): boolean;
  startsWith(searchString: string, position?: number): boolean;
  endsWith(searchString: string, position?: number): boolean;
  repeat(count: number): string;
  padStart(length: number, fillStr?: string = ' '): string;
  padEnd(length: number, fillStr?: string = ' '): string;
  codePointAt(pos: number): number | void;
  match(template: any): any; // ES2015+ fix for @@match support
  matchAll(regexp: RegExp): Iterator;
  replace(template: any, replacer: any): any; // ES2015+ fix for @@replace support
  replaceAll(searchValue: string | RegExp, replaceString: string | (searchValue, index, this) => string): string;
  search(template: any): any; // ES2015+ fix for @@search support
  split(template: any, limit?: int): Array<string>; // ES2015+ fix for @@split support, some fixes for old engines
  trim(): string;
  trimLeft(): string;
  trimRight(): string;
  trimStart(): string;
  trimEnd(): string;
  isWellFormed(): boolean;
  toWellFormed(): string;
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

class RegExp {
  // support for sticky (`y`) flag, dotAll (`s`) flag, named capture groups, can alter flags
  constructor(pattern: RegExp | string, flags?: string): RegExp;
  static escape(value: string): string;
  exec(string: string): Array<string | undefined> | null; // IE8 fixes
  test(string: string): boolean; // delegation to `.exec`
  toString(): string; // ES2015+ fix - generic
  @@match(string: string): Array | null;
  @@matchAll(string: string): Iterator;
  @@replace(string: string, replaceValue: Function | string): string;
  @@search(string: string): number;
  @@split(string: string, limit?: number): Array<string>;
  readonly attribute dotAll: boolean; // IE9+
  readonly attribute flags: string;   // IE9+
  readonly attribute sticky: boolean; // IE9+
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/string
core-js(-pure)/es|stable|actual|full/string/virtual
core-js(-pure)/es|stable|actual|full/string/from-code-point
core-js(-pure)/es|stable|actual|full/string/raw
core-js/es|stable|actual|full/string/match
core-js/es|stable|actual|full/string/replace
core-js/es|stable|actual|full/string/search
core-js/es|stable|actual|full/string/split
core-js(-pure)/es|stable|actual/string(/prototype)/at
core-js(-pure)/es|stable|actual|full/string(/prototype)/code-point-at
core-js(-pure)/es|stable|actual|full/string(/prototype)/ends-with
core-js(-pure)/es|stable|actual|full/string(/prototype)/includes
core-js(-pure)/es|stable|actual|full/string(/prototype)/starts-with
core-js(-pure)/es|stable|actual|full/string(/prototype)/match-all
core-js(-pure)/es|stable|actual|full/string(/prototype)/pad-start
core-js(-pure)/es|stable|actual|full/string(/prototype)/pad-end
core-js(-pure)/es|stable|actual|full/string(/prototype)/repeat
core-js(-pure)/es|stable|actual|full/string(/prototype)/replace-all
core-js(-pure)/es|stable|actual|full/string(/prototype)/trim
core-js(-pure)/es|stable|actual|full/string(/prototype)/trim-start
core-js(-pure)/es|stable|actual|full/string(/prototype)/trim-end
core-js(-pure)/es|stable|actual|full/string(/prototype)/trim-left
core-js(-pure)/es|stable|actual|full/string(/prototype)/trim-right
core-js(-pure)/es|stable|actual|full/string(/prototype)/is-well-formed
core-js(-pure)/es|stable|actual|full/string(/prototype)/to-well-formed
core-js(-pure)/es|stable|actual|full/string(/prototype)/anchor
core-js(-pure)/es|stable|actual|full/string(/prototype)/big
core-js(-pure)/es|stable|actual|full/string(/prototype)/blink
core-js(-pure)/es|stable|actual|full/string(/prototype)/bold
core-js(-pure)/es|stable|actual|full/string(/prototype)/fixed
core-js(-pure)/es|stable|actual|full/string(/prototype)/fontcolor
core-js(-pure)/es|stable|actual|full/string(/prototype)/fontsize
core-js(-pure)/es|stable|actual|full/string(/prototype)/italics
core-js(-pure)/es|stable|actual|full/string(/prototype)/link
core-js(-pure)/es|stable|actual|full/string(/prototype)/small
core-js(-pure)/es|stable|actual|full/string(/prototype)/strike
core-js(-pure)/es|stable|actual|full/string(/prototype)/sub
core-js(-pure)/es|stable|actual|full/string(/prototype)/sup
core-js(-pure)/es|stable|actual|full/string(/prototype)/iterator
core-js/es|stable|actual|full/regexp
core-js/es|stable|actual|full/regexp/constructor
core-js(-pure)/es|stable|actual|full/regexp/escape
core-js/es|stable|actual|full/regexp/dot-all
core-js(-pure)/es|stable|actual|full/regexp/flags
core-js/es|stable|actual|full/regexp/match
core-js/es|stable|actual|full/regexp/replace
core-js/es|stable|actual|full/regexp/search
core-js/es|stable|actual|full/regexp/split
core-js/es|stable|actual|full/regexp/sticky
core-js/es|stable|actual|full/regexp/test
core-js/es|stable|actual|full/regexp/to-string
```
[*Examples*](https://core-js.io/playground#code=for+%28let+value+of+%27a%F0%A0%AE%B7b%27%29+%7B%0A++console.log%28value%29%3B+%2F%2F+-%3E+%27a%27%2C+%27%F0%A0%AE%B7%27%2C+%27b%27%0A%7D%0A%0A%27foobarbaz%27.includes%28%27bar%27%29%3B++++++%2F%2F+%3D%3E+true%0A%27foobarbaz%27.includes%28%27bar%27%2C+4%29%3B+++%2F%2F+%3D%3E+false%0A%27foobarbaz%27.startsWith%28%27foo%27%29%3B++++%2F%2F+%3D%3E+true%0A%27foobarbaz%27.startsWith%28%27bar%27%2C+3%29%3B+%2F%2F+%3D%3E+true%0A%27foobarbaz%27.endsWith%28%27baz%27%29%3B++++++%2F%2F+%3D%3E+true%0A%27foobarbaz%27.endsWith%28%27bar%27%2C+6%29%3B+++%2F%2F+%3D%3E+true%0A%0A%27string%27.repeat%283%29%3B+%2F%2F+%3D%3E+%27stringstringstring%27%0A%0A%27hello%27.padStart%2810%29%3B+++++++++%2F%2F+%3D%3E+%27+++++hello%27%0A%27hello%27.padStart%2810%2C+%271234%27%29%3B+%2F%2F+%3D%3E+%2712341hello%27%0A%27hello%27.padEnd%2810%29%3B+++++++++++%2F%2F+%3D%3E+%27hello+++++%27%0A%27hello%27.padEnd%2810%2C+%271234%27%29%3B+++%2F%2F+%3D%3E+%27hello12341%27%0A%0A%27%F0%A0%AE%B7%27.codePointAt%280%29%3B+%2F%2F+%3D%3E+134071%0AString.fromCodePoint%2897%2C+134071%2C+98%29%3B+%2F%2F+%3D%3E+%27a%F0%A0%AE%B7b%27%0A%0Alet+name+%3D+%27Bob%27%3B%0AString.raw%60Hi%5Cn%24%7B+name+%7D%21%60%3B+++++++++++%2F%2F+%3D%3E+%27Hi%5C%5CnBob%21%27+%28ES2015+template+string+syntax%29%0AString.raw%28%7B+raw%3A+%27test%27+%7D%2C+0%2C+1%2C+2%29%3B+%2F%2F+%3D%3E+%27t0e1s2t%27%0A%0A%27foo%27.bold%28%29%3B++++++++++++++++++++++%2F%2F+%3D%3E+%27%3Cb%3Efoo%3C%2Fb%3E%27%0A%27bar%27.anchor%28%27a%22b%27%29%3B+++++++++++++++%2F%2F+%3D%3E+%27%3Ca+name%3D%22a%26quot%3Bb%22%3Ebar%3C%2Fa%3E%27%0A%27baz%27.link%28%27https%3A%2F%2Fexample.com%27%29%3B+%2F%2F+%3D%3E+%27%3Ca+href%3D%22https%3A%2F%2Fexample.com%22%3Ebaz%3C%2Fa%3E%27%0A%0ARegExp%28%27.%27%2C+%27s%27%29.test%28%27%5Cn%27%29%3B+%2F%2F+%3D%3E+true%0ARegExp%28%27.%27%2C+%27s%27%29.dotAll%3B+++++%2F%2F+%3D%3E+true%0A%0ARegExp%28%27foo%3A%28%3F%3Cfoo%3E%5C%5Cw%2B%29%2Cbar%3A%28%3F%3Cbar%3E%5C%5Cw%2B%29%27%29.exec%28%27foo%3Aabc%2Cbar%3Adef%27%29.groups%3B+%2F%2F+%3D%3E+%7B+foo%3A+%27abc%27%2C+bar%3A+%27def%27+%7D%0A%0A%27foo%3Aabc%2Cbar%3Adef%27.replace%28RegExp%28%27foo%3A%28%3F%3Cfoo%3E%5C%5Cw%2B%29%2Cbar%3A%28%3F%3Cbar%3E%5C%5Cw%2B%29%27%29%2C+%27%24%3Cbar%3E%2C%24%3Cfoo%3E%27%29%3B+%2F%2F+%3D%3E+%27def%2Cabc%27%0A%0A%2F%2F+eslint-disable-next-line+regexp%2Fno-useless-flag+--+example%0ARegExp%28%2F.%2Fg%2C+%27m%27%29%3B+%2F%2F+%3D%3E+%2F.%2Fm%0A%0A%2Ffoo%2F.flags%3B+++%2F%2F+%3D%3E+%27%27%0A%2Ffoo%2Fgi.flags%3B+%2F%2F+%3D%3E+%27gi%27%0A%0ARegExp%28%27foo%27%2C+%27y%27%29.sticky%3B+%2F%2F+%3D%3E+true%0A%0Aconst+text+%3D+%27First+line%5CnSecond+line%27%3B%0Aconst+regex+%3D+RegExp%28%27%28%3F%3Cindex%3E%5C%5CS%2B%29+line%5C%5Cn%3F%27%2C+%27y%27%29%3B%0A%0Aregex.exec%28text%29.groups.index%3B+%2F%2F+%3D%3E+%27First%27%0Aregex.exec%28text%29.groups.index%3B+%2F%2F+%3D%3E+%27Second%27%0Aregex.exec%28text%29%3B++++%2F%2F+%3D%3E+null%0A%0A%27foo%27.match%28%7B+%5BSymbol.match%5D%3A+%28%29+%3D%3E+1+%7D%29%3B+++++%2F%2F+%3D%3E+1%0A%27foo%27.replace%28%7B+%5BSymbol.replace%5D%3A+%28%29+%3D%3E+2+%7D%29%3B+%2F%2F+%3D%3E+2%0A%27foo%27.search%28%7B+%5BSymbol.search%5D%3A+%28%29+%3D%3E+3+%7D%29%3B+++%2F%2F+%3D%3E+3%0A%27foo%27.split%28%7B+%5BSymbol.split%5D%3A+%28%29+%3D%3E+4+%7D%29%3B+++++%2F%2F+%3D%3E+4%0A%0ARegExp.prototype.toString.call%28%7B+source%3A+%27foo%27%2C+flags%3A+%27bar%27+%7D%29%3B+%2F%2F+%3D%3E+%27%2Ffoo%2Fbar%27%0A%0A%27+++hello+++%27.trimLeft%28%29%3B++%2F%2F+%3D%3E+%27hello+++%27%0A%27+++hello+++%27.trimRight%28%29%3B+%2F%2F+%3D%3E+%27+++hello%27%0A%27+++hello+++%27.trimStart%28%29%3B+%2F%2F+%3D%3E+%27hello+++%27%0A%27+++hello+++%27.trimEnd%28%29%3B+++%2F%2F+%3D%3E+%27+++hello%27%0A%0Afor+%28let+%7B+groups%3A+%7B+number%2C+letter+%7D+%7D+of+%271111a2b3cccc%27.matchAll%28RegExp%28%27%28%3F%3Cnumber%3E%5C%5Cd%29%28%3F%3Cletter%3E%5C%5CD%29%27%2C+%27g%27%29%29%29+%7B%0A++console.log%28number%2C+letter%29%3B+%2F%2F+-%3E+1+a%2C+2+b%2C+3+c%0A%7D%0A%0A%27Test+abc+test+test+abc+test.%27.replaceAll%28%27abc%27%2C+%27foo%27%29%3B+%2F%2F+%3D%3E+%27Test+foo+test+test+foo+test.%27%0A%0A%27abc%27.at%281%29%3B++%2F%2F+%3D%3E+%27b%27%0A%27abc%27.at%28-1%29%3B+%2F%2F+%3D%3E+%27c%27%0A%0A%27a%F0%9F%92%A9b%27.isWellFormed%28%29%3B++++++%2F%2F+%3D%3E+true%0A%27a%5CuD83Db%27.isWellFormed%28%29%3B++%2F%2F+%3D%3E+false%0A%0A%27a%F0%9F%92%A9b%27.toWellFormed%28%29%3B++++++%2F%2F+%3D%3E+%27a%F0%9F%92%A9b%27%0A%27a%5CuD83Db%27.toWellFormed%28%29%3B++%2F%2F+%3D%3E+%27a%EF%BF%BDb%27):
```js
for (let value of 'a𠮷b') {
  console.log(value); // -> 'a', '𠮷', 'b'
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
String.raw`Hi\n${ name }!`;           // => 'Hi\\nBob!' (ES2015 template string syntax)
String.raw({ raw: 'test' }, 0, 1, 2); // => 't0e1s2t'

'foo'.bold();                      // => '<b>foo</b>'
'bar'.anchor('a"b');               // => '<a name="a&quot;b">bar</a>'
'baz'.link('https://example.com'); // => '<a href="https://example.com">baz</a>'

RegExp('.', 's').test('\n'); // => true
RegExp('.', 's').dotAll;     // => true

RegExp('foo:(?<foo>\\w+),bar:(?<bar>\\w+)').exec('foo:abc,bar:def').groups; // => { foo: 'abc', bar: 'def' }

'foo:abc,bar:def'.replace(RegExp('foo:(?<foo>\\w+),bar:(?<bar>\\w+)'), '$<bar>,$<foo>'); // => 'def,abc'

// eslint-disable-next-line regexp/no-useless-flag -- example
RegExp(/./g, 'm'); // => /./m

/foo/.flags;   // => ''
/foo/gi.flags; // => 'gi'

RegExp('foo', 'y').sticky; // => true

const text = 'First line\nSecond line';
const regex = RegExp('(?<index>\\S+) line\\n?', 'y');

regex.exec(text).groups.index; // => 'First'
regex.exec(text).groups.index; // => 'Second'
regex.exec(text);    // => null

'foo'.match({ [Symbol.match]: () => 1 });     // => 1
'foo'.replace({ [Symbol.replace]: () => 2 }); // => 2
'foo'.search({ [Symbol.search]: () => 3 });   // => 3
'foo'.split({ [Symbol.split]: () => 4 });     // => 4

RegExp.prototype.toString.call({ source: 'foo', flags: 'bar' }); // => '/foo/bar'

'   hello   '.trimLeft();  // => 'hello   '
'   hello   '.trimRight(); // => '   hello'
'   hello   '.trimStart(); // => 'hello   '
'   hello   '.trimEnd();   // => '   hello'

for (let { groups: { number, letter } } of '1111a2b3cccc'.matchAll(RegExp('(?<number>\\d)(?<letter>\\D)', 'g'))) {
  console.log(number, letter); // -> 1 a, 2 b, 3 c
}

'Test abc test test abc test.'.replaceAll('abc', 'foo'); // => 'Test foo test test foo test.'

'abc'.at(1);  // => 'b'
'abc'.at(-1); // => 'c'

'a💩b'.isWellFormed();      // => true
'a\uD83Db'.isWellFormed();  // => false

'a💩b'.toWellFormed();      // => 'a💩b'
'a\uD83Db'.toWellFormed();  // => 'a�b'
```

[*Examples*](https://core-js.io/playground#code=RegExp.escape%28%2710%24%27%29%3B+%2F%2F+%3D%3E+%27%5C%5Cx310%5C%5C%24%27%0ARegExp.escape%28%27abcdefg_123456%27%29%3B+%2F%2F+%3D%3E+%27%5C%5Cx61bcdefg_123456%27%0ARegExp.escape%28%27%D0%9F%D1%80%D0%B8%D0%B2%D0%B5%D1%82%27%29%3B+%2F%2F+%3D%3E+%27%D0%9F%D1%80%D0%B8%D0%B2%D0%B5%D1%82%27%0ARegExp.escape%28%27%28%29%7B%7D%5B%5D%7C%2C.%3F%2A%2B-%5E%24%3D%3C%3E%5C%5C%2F%23%26%21%25%3A%3B%40~%5C%27%22%60%27%29%3B%0A%2F%2F+%3D%3E+%27%5C%5C%28%5C%5C%29%5C%5C%7B%5C%5C%7D%5C%5C%5B%5C%5C%5D%5C%5C%7C%5C%5Cx2c%5C%5C.%5C%5C%3F%5C%5C%2A%5C%5C%2B%5C%5Cx2d%5C%5C%5E%5C%5C%24%5C%5Cx3d%5C%5Cx3c%5C%5Cx3e%5C%5C%5C%5C%5C%5C%2F%5C%5Cx23%5C%5Cx26%5C%5Cx21%5C%5Cx25%5C%5Cx3a%5C%5Cx3b%5C%5Cx40%5C%5Cx7e%5C%5Cx27%5C%5Cx22%5C%5Cx60%27%0ARegExp.escape%28%27%5Cu0009%5Cu000A%5Cu000B%5Cu000C%5Cu000D%5Cu0020%5Cu00A0%5Cu1680%5Cu2000%5Cu2001%5Cu2002%5Cu2003%5Cu2004%5Cu2005%5Cu2006%5Cu2007%5Cu2008%5Cu2009%5Cu200A%5Cu202F%5Cu205F%5Cu3000%5Cu2028%5Cu2029%5CuFEFF%27%29%3B%0A%2F%2F+%3D%3E+%27%5C%5Ct%5C%5Cn%5C%5Cv%5C%5Cf%5C%5Cr%5C%5Cx20%5C%5Cxa0%5C%5Cu1680%5C%5Cu2000%5C%5Cu2001%5C%5Cu2002%5C%5Cu2003%5C%5Cu2004%5C%5Cu2005%5C%5Cu2006%5C%5Cu2007%5C%5Cu2008%5C%5Cu2009%5C%5Cu200a%5C%5Cu202f%5C%5Cu205f%5C%5Cu3000%5C%5Cu2028%5C%5Cu2029%5C%5Cufeff%27%0ARegExp.escape%28%27%F0%9F%92%A9%27%29%3B+%2F%2F+%3D%3E+%27%F0%9F%92%A9%27%0ARegExp.escape%28%27%5CuD83D%27%29%3B+%2F%2F+%3D%3E+%27%5C%5Cud83d%27):
```js
RegExp.escape('10$'); // => '\\x310\\$'
RegExp.escape('abcdefg_123456'); // => '\\x61bcdefg_123456'
RegExp.escape('Привет'); // => 'Привет'
RegExp.escape('(){}[]|,.?*+-^$=<>\\/#&!%:;@~\'"`');
// => '\\(\\)\\{\\}\\[\\]\\|\\x2c\\.\\?\\*\\+\\x2d\\^\\$\\x3d\\x3c\\x3e\\\\\\/\\x23\\x26\\x21\\x25\\x3a\\x3b\\x40\\x7e\\x27\\x22\\x60'
RegExp.escape('\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF');
// => '\\t\\n\\v\\f\\r\\x20\\xa0\\u1680\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000\\u2028\\u2029\\ufeff'
RegExp.escape('💩'); // => '💩'
RegExp.escape('\uD83D'); // => '\\ud83d'
```

#### ECMAScript: Number[⬆](#index)
Modules [`es.number.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.number.constructor.js). The `Number` constructor supports binary and octal literals, [*examples*](https://core-js.io/playground#code=Number%28%270b1010101%27%29%3B+%2F%2F+%3D%3E+85%0ANumber%28%270o7654321%27%29%3B+%2F%2F+%3D%3E+2054353):
```js
Number('0b1010101'); // => 85
Number('0o7654321'); // => 2054353
```
Modules [`es.number.epsilon`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.number.epsilon.js), [`es.number.is-finite`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.number.is-finite.js), [`es.number.is-integer`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.number.is-integer.js), [`es.number.is-nan`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.number.is-nan.js), [`es.number.is-safe-integer`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.number.is-safe-integer.js), [`es.number.max-safe-integer`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.number.max-safe-integer.js), [`es.number.min-safe-integer`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.number.min-safe-integer.js), [`es.number.parse-float`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.number.parse-float.js), [`es.number.parse-int`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.number.parse-int.js), [`es.number.to-exponential`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.number.to-exponential.js), [`es.number.to-fixed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.number.to-fixed.js), [`es.parse-int`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.parse-int.js), [`es.parse-float`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.parse-float.js).
```ts
class Number {
  constructor(value: any): number;
  toExponential(digits?: number): string;
  toFixed(digits?: number): string;
  static isFinite(number: any): boolean;
  static isNaN(number: any): boolean;
  static isInteger(number: any): boolean;
  static isSafeInteger(number: any): boolean;
  static parseFloat(string: string): number;
  static parseInt(string: string, radix?: number): number;
  static EPSILON: number;
  static MAX_SAFE_INTEGER: number;
  static MIN_SAFE_INTEGER: number;
}

function parseFloat(string: string): number;
function parseInt(string: string, radix?: number): number;
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/number
core-js(-pure)/es|stable|actual|full/number/virtual
core-js(-pure)/es|stable|actual|full/number/constructor
core-js(-pure)/es|stable|actual|full/number/is-finite
core-js(-pure)/es|stable|actual|full/number/is-nan
core-js(-pure)/es|stable|actual|full/number/is-integer
core-js(-pure)/es|stable|actual|full/number/is-safe-integer
core-js(-pure)/es|stable|actual|full/number/parse-float
core-js(-pure)/es|stable|actual|full/number/parse-int
core-js(-pure)/es|stable|actual|full/number/epsilon
core-js(-pure)/es|stable|actual|full/number/max-safe-integer
core-js(-pure)/es|stable|actual|full/number/min-safe-integer
core-js(-pure)/es|stable|actual|full/number(/prototype)/to-exponential
core-js(-pure)/es|stable|actual|full/number(/prototype)/to-fixed
core-js(-pure)/es|stable|actual|full/parse-float
core-js(-pure)/es|stable|actual|full/parse-int
```
#### ECMAScript: Math[⬆](#index)
Modules [`es.math.acosh`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.acosh.js), [`es.math.asinh`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.asinh.js), [`es.math.atanh`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.atanh.js), [`es.math.cbrt`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.cbrt.js), [`es.math.clz32`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.clz32.js), [`es.math.cosh`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.cosh.js), [`es.math.expm1`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.expm1.js), [`es.math.fround`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.fround.js), [`es.math.f16round`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.f16round.js), [`es.math.hypot`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.hypot.js), [`es.math.imul`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.imul.js), [`es.math.log10`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.log10.js), [`es.math.log1p`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.log1p.js), [`es.math.log2`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.log2.js), [`es.math.sign`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.sign.js), [`es.math.sinh`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.sinh.js), [`es.math.sum-precise`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.sum-precise.js), [`es.math.tanh`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.tanh.js), [`es.math.trunc`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.trunc.js), [`es.math.to-string-tag`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.to-string-tag.js).
```ts
namespace Math {
  acosh(number: number): number;
  asinh(number: number): number;
  atanh(number: number): number;
  cbrt(number: number): number;
  clz32(number: number): number;
  cosh(number: number): number;
  expm1(number: number): number;
  fround(number: number): number;
  f16round(number: any): number;
  hypot(...args: Array<number>): number;
  imul(number1: number, number2: number): number;
  log1p(number: number): number;
  log10(number: number): number;
  log2(number: number): number;
  sign(number: number): 1 | -1 | 0 | -0 | NaN;
  sinh(number: number): number;
  sumPrecise(items: Iterable<number>): number;
  tanh(number: number): number;
  trunc(number: number): number;
  @@toStringTag: 'Math';
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/math
core-js(-pure)/es|stable|actual|full/math/acosh
core-js(-pure)/es|stable|actual|full/math/asinh
core-js(-pure)/es|stable|actual|full/math/atanh
core-js(-pure)/es|stable|actual|full/math/cbrt
core-js(-pure)/es|stable|actual|full/math/clz32
core-js(-pure)/es|stable|actual|full/math/cosh
core-js(-pure)/es|stable|actual|full/math/expm1
core-js(-pure)/es|stable|actual|full/math/fround
core-js(-pure)/es|stable|actual|full/math/f16round
core-js(-pure)/es|stable|actual|full/math/hypot
core-js(-pure)/es|stable|actual|full/math/imul
core-js(-pure)/es|stable|actual|full/math/log1p
core-js(-pure)/es|stable|actual|full/math/log10
core-js(-pure)/es|stable|actual|full/math/log2
core-js(-pure)/es|stable|actual|full/math/sign
core-js(-pure)/es|stable|actual|full/math/sinh
core-js(-pure)/es|stable|actual|full/math/sum-precise
core-js(-pure)/es|stable|actual|full/math/tanh
core-js(-pure)/es|stable|actual|full/math/trunc
core-js(-pure)/es|stable|actual|full/math/to-string-tag
```
[*Examples*](https://core-js.io/playground#code=1e20+%2B+0.1+%2B+-1e20%3B+%2F%2F+%3D%3E+0%0AMath.sumPrecise%28%5B1e20%2C+0.1%2C+-1e20%5D%29%3B+%2F%2F+%3D%3E+0.1):
```js
1e20 + 0.1 + -1e20; // => 0
Math.sumPrecise([1e20, 0.1, -1e20]); // => 0.1
```

#### ECMAScript: Date[⬆](#index)
Module [`es.date.to-primitive`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.date.to-primitive.js), ES5 feature with fixes: [`es.date.to-json`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.date.to-json.js).

```ts
class Date {
  toJSON(): string | null;
  @@toPrimitive(hint: 'default' | 'number' | 'string'): string | number;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/es|stable|actual|full/date
core-js(-pure)/es|stable|actual|full/date/to-json
```

#### ECMAScript: Promise[⬆](#index)
Modules [`es.promise`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.promise.js), [`es.promise.catch`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.promise.catch.js), [`es.promise.finally`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.promise.finally.js), [`es.promise.resolve`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.promise.resolve.js), [`es.promise.reject`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.promise.reject.js), [`es.promise.all`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.promise.all.js), [`es.promise.race`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.promise.race.js), [`es.promise.all-settled`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.promise.all-settled.js), [`es.promise.any`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.promise.any.js), [`es.promise.try`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.promise.try.js) and [`es.promise.with-resolvers`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.promise.with-resolvers.js).
```ts
class Promise {
  constructor(executor: (resolve: Function, reject: Function) => void): Promise;
  then(onFulfilled?: Function, onRejected?: Function): Promise;
  catch(onRejected: Function): Promise;
  finally(onFinally: Function): Promise;
  static all(iterable: Iterable): Promise;
  static allSettled(iterable: Iterable): Promise;
  static any(promises: Iterable): Promise;
  static race(iterable: Iterable): Promise;
  static reject(r: any): Promise;
  static resolve(x: any): Promise;
  static try(callbackfn: Function, ...args: Array<mixed>): Promise;
  static withResolvers(): { promise: Promise, resolve: Function, reject: Function };
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/promise
core-js(-pure)/es|stable|actual|full/promise/all-settled
core-js(-pure)/es|stable|actual|full/promise/any
core-js(-pure)/es|stable|actual|full/promise/finally
core-js(-pure)/es|stable|actual|full/promise/try
core-js(-pure)/es|stable|actual|full/promise/with-resolvers
```
Basic [*examples*](https://core-js.io/playground#code=%2F%2A+eslint-disable+promise%2Fprefer-await-to-callbacks+--+example+%2A%2F%0Afunction+sleepRandom%28time%29+%7B%0A++return+new+Promise%28%28resolve%2C+reject%29+%3D%3E+%7B%0A++++setTimeout%28resolve%2C+time+%2A+1e3%2C+0+%7C+Math.random%28%29+%2A+1e3%29%3B%0A++%7D%29%3B%0A%7D%0A%0Aconsole.log%28%27Run%27%29%3B++++++++++++++++++++%2F%2F+-%3E+Run%0AsleepRandom%285%29.then%28result+%3D%3E+%7B%0A++console.log%28result%29%3B+++++++++++++++++%2F%2F+-%3E+869%2C+after+5+sec.%0A++return+sleepRandom%2810%29%3B%0A%7D%29.then%28result+%3D%3E+%7B%0A++console.log%28result%29%3B+++++++++++++++++%2F%2F+-%3E+202%2C+after+10+sec.%0A%7D%29.then%28%28%29+%3D%3E+%7B%0A++console.log%28%27immediately+after%27%29%3B++++%2F%2F+-%3E+immediately+after%0A++throw+new+Error%28%27Irror%21%27%29%3B%0A%7D%29.then%28%28%29+%3D%3E+%7B%0A++console.log%28%27will+not+be+displayed%27%29%3B%0A%7D%29.catch%28error+%3D%3E+console.log%28error%29%29%3B+%2F%2F+-%3E+Error%3A+Irror%21):
```js
/* eslint-disable promise/prefer-await-to-callbacks -- example */
function sleepRandom(time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time * 1e3, 0 | Math.random() * 1e3);
  });
}

console.log('Run');                    // -> Run
sleepRandom(5).then(result => {
  console.log(result);                 // -> 869, after 5 sec.
  return sleepRandom(10);
}).then(result => {
  console.log(result);                 // -> 202, after 10 sec.
}).then(() => {
  console.log('immediately after');    // -> immediately after
  throw new Error('Irror!');
}).then(() => {
  console.log('will not be displayed');
}).catch(error => console.log(error)); // -> Error: Irror!
```
`Promise.resolve` and `Promise.reject` [*examples*](https://core-js.io/playground#code=%2F%2A+eslint-disable+promise%2Fprefer-await-to-callbacks+--+example+%2A%2F%0APromise.resolve%2842%29.then%28x+%3D%3E+console.log%28x%29%29%3B+++++++++%2F%2F+-%3E+42%0APromise.reject%2842%29.catch%28error+%3D%3E+console.log%28error%29%29%3B+%2F%2F+-%3E+42%0A%0APromise.resolve%28%24.getJSON%28%27%2Fdata.json%27%29%29%3B+%2F%2F+%3D%3E+ES+promise):
```js
/* eslint-disable promise/prefer-await-to-callbacks -- example */
Promise.resolve(42).then(x => console.log(x));         // -> 42
Promise.reject(42).catch(error => console.log(error)); // -> 42

Promise.resolve($.getJSON('/data.json')); // => ES promise
```
`Promise#finally` [*examples*](https://core-js.io/playground#code=Promise.resolve%2842%29.finally%28%28%29+%3D%3E+console.log%28%27You+will+see+it+anyway%27%29%29%3B%0A%0APromise.reject%2842%29.finally%28%28%29+%3D%3E+console.log%28%27You+will+see+it+anyway%27%29%29%3B):
```js
Promise.resolve(42).finally(() => console.log('You will see it anyway'));

Promise.reject(42).finally(() => console.log('You will see it anyway'));
```
`Promise.all` [*examples*](https://core-js.io/playground#code=function+sleepRandom%28time%29+%7B%0A++return+new+Promise%28%28resolve%2C+reject%29+%3D%3E+%7B%0A++++setTimeout%28resolve%2C+time+%2A+1e3%2C+0+%7C+Math.random%28%29+%2A+1e3%29%3B%0A++%7D%29%3B%0A%7D%0A%0APromise.all%28%5B%0A++%27foo%27%2C%0A++sleepRandom%285%29%2C%0A++sleepRandom%2815%29%2C%0A++sleepRandom%2810%29%2C++++++++++++%2F%2F+after+15+sec%3A%0A%5D%29.then%28x+%3D%3E+console.log%28x%29%29%3B+%2F%2F+-%3E+%5B%27foo%27%2C+956%2C+85%2C+382%5D):
```js
Promise.all([
  'foo',
  sleepRandom(5),
  sleepRandom(15),
  sleepRandom(10),            // after 15 sec:
]).then(x => console.log(x)); // -> ['foo', 956, 85, 382]
```
`Promise.race` [*examples*](https://core-js.io/playground#code=%2F%2A+eslint-disable+promise%2Fprefer-await-to-callbacks+--+example+%2A%2F%0Afunction+sleepRandom%28time%29+%7B%0A++return+new+Promise%28%28resolve%2C+reject%29+%3D%3E+%7B%0A++++setTimeout%28resolve%2C+time+%2A+1e3%2C+0+%7C+Math.random%28%29+%2A+1e3%29%3B%0A++%7D%29%3B%0A%7D%0A%0Afunction+timeLimit%28promise%2C+time%29+%7B%0A++return+Promise.race%28%5Bpromise%2C+new+Promise%28%28resolve%2C+reject%29+%3D%3E+%7B%0A++++setTimeout%28reject%2C+time+%2A+1e3%2C+new+Error%28%60Await+%3E+%24%7B+time+%7D+sec%60%29%29%3B%0A++%7D%29%5D%29%3B%0A%7D%0A%0AtimeLimit%28sleepRandom%285%29%2C+10%29.then%28x+%3D%3E+console.log%28x%29%29%3B+++++++++++%2F%2F+-%3E+853%2C+after+5+sec.%0AtimeLimit%28sleepRandom%2815%29%2C+10%29.catch%28error+%3D%3E+console.log%28error%29%29%3B+%2F%2F+-%3E+Error%3A+Await+%3E+10+sec):
```js
/* eslint-disable promise/prefer-await-to-callbacks -- example */
function timeLimit(promise, time) {
  return Promise.race([promise, new Promise((resolve, reject) => {
    setTimeout(reject, time * 1e3, new Error(`Await > ${ time } sec`));
  })]);
}

timeLimit(sleepRandom(5), 10).then(x => console.log(x));           // -> 853, after 5 sec.
timeLimit(sleepRandom(15), 10).catch(error => console.log(error)); // -> Error: Await > 10 sec
```
`Promise.allSettled` [*examples*](https://core-js.io/playground#code=Promise.allSettled%28%5B%0A++Promise.resolve%281%29%2C%0A++Promise.reject%282%29%2C%0A++Promise.resolve%283%29%2C%0A%5D%29.then%28console.log%29%3B+%2F%2F+-%3E+%5B%7B+value%3A+1%2C+status%3A+%27fulfilled%27+%7D%2C+%7B+reason%3A+2%2C+status%3A+%27rejected%27+%7D%2C+%7B+value%3A+3%2C+status%3A+%27fulfilled%27+%7D%5D):
```js
Promise.allSettled([
  Promise.resolve(1),
  Promise.reject(2),
  Promise.resolve(3),
]).then(console.log); // -> [{ value: 1, status: 'fulfilled' }, { reason: 2, status: 'rejected' }, { value: 3, status: 'fulfilled' }]
```
`Promise.any` [*examples*](https://core-js.io/playground#code=Promise.any%28%5B%0A++Promise.resolve%281%29%2C%0A++Promise.reject%282%29%2C%0A++Promise.resolve%283%29%2C%0A%5D%29.then%28console.log%29%3B+%2F%2F+-%3E+1%0A%0APromise.any%28%5B%0A++Promise.reject%281%29%2C%0A++Promise.reject%282%29%2C%0A++Promise.reject%283%29%2C%0A%5D%29.catch%28%28%7B+errors+%7D%29+%3D%3E+console.log%28errors%29%29%3B+%2F%2F+-%3E+%5B1%2C+2%2C+3%5D):
```js
Promise.any([
  Promise.resolve(1),
  Promise.reject(2),
  Promise.resolve(3),
]).then(console.log); // -> 1

Promise.any([
  Promise.reject(1),
  Promise.reject(2),
  Promise.reject(3),
]).catch(({ errors }) => console.log(errors)); // -> [1, 2, 3]
```
`Promise.try` [*examples*](https://core-js.io/playground#code=%2F%2A+eslint-disable+promise%2Fprefer-await-to-callbacks+--+example+%2A%2F%0APromise.try%28%28%29+%3D%3E+42%29.then%28it+%3D%3E+console.log%28%60Promise%2C+resolved+as+%24%7B+it+%7D%60%29%29%3B%0A%0APromise.try%28%28%29+%3D%3E+%7B+throw+new+Error%28%2742%27%29%3B+%7D%29.catch%28error+%3D%3E+console.log%28%60Promise%2C+rejected+as+%24%7B+error+%7D%60%29%29%3B%0A%0APromise.try%28async+%28%29+%3D%3E+42%29.then%28it+%3D%3E+console.log%28%60Promise%2C+resolved+as+%24%7B+it+%7D%60%29%29%3B%0A%0APromise.try%28async+%28%29+%3D%3E+%7B+throw+new+Error%28%2742%27%29%3B+%7D%29.catch%28error+%3D%3E+console.log%28%60Promise%2C+rejected+as+%24%7B+error+%7D%60%29%29%3B%0A%0APromise.try%28it+%3D%3E+it%2C+42%29.then%28it+%3D%3E+console.log%28%60Promise%2C+resolved+as+%24%7B+it+%7D%60%29%29%3B):
```js
/* eslint-disable promise/prefer-await-to-callbacks -- example */
Promise.try(() => 42).then(it => console.log(`Promise, resolved as ${ it }`));

Promise.try(() => { throw new Error('42'); }).catch(error => console.log(`Promise, rejected as ${ error }`));

Promise.try(async () => 42).then(it => console.log(`Promise, resolved as ${ it }`));

Promise.try(async () => { throw new Error('42'); }).catch(error => console.log(`Promise, rejected as ${ error }`));

Promise.try(it => it, 42).then(it => console.log(`Promise, resolved as ${ it }`));
```
`Promise.withResolvers` [*examples*](https://core-js.io/playground#code=const+d+%3D+Promise.withResolvers%28%29%3B%0Ad.resolve%2842%29%3B%0Ad.promise.then%28console.log%29%3B+%2F%2F+-%3E+42):
```js
const d = Promise.withResolvers();
d.resolve(42);
d.promise.then(console.log); // -> 42
```
[*Examples*](https://core-js.io/playground#code=let+delay+%3D+time+%3D%3E+new+Promise%28resolve+%3D%3E+setTimeout%28resolve%2C+time%29%29%3B%0A%0Aasync+function+sleepRandom%28time%29+%7B%0A++await+delay%28time+%2A+1e3%29%3B%0A++return+0+%7C+Math.random%28%29+%2A+1e3%3B%0A%7D%0A%0Aasync+function+sleepError%28time%2C+msg%29+%7B%0A++await+delay%28time+%2A+1e3%29%3B%0A++throw+new+Error%28msg%29%3B%0A%7D%0A%0A%28async+%28%29+%3D%3E+%7B%0A++try+%7B%0A++++console.log%28%27Run%27%29%3B++++++++++++++++%2F%2F+-%3E+Run%0A++++console.log%28await+sleepRandom%285%29%29%3B+%2F%2F+-%3E+936%2C+after+5+sec.%0A++++let+%5Ba%2C+b%2C+c%5D+%3D+await+Promise.all%28%5B%0A++++++sleepRandom%285%29%2C%0A++++++sleepRandom%2815%29%2C%0A++++++sleepRandom%2810%29%2C%0A++++%5D%29%3B%0A++++console.log%28a%2C+b%2C+c%29%3B++++++++++++++%2F%2F+-%3E+210+445+71%2C+after+15+sec.%0A++++await+sleepError%285%2C+%27Error%21%27%29%3B%0A++++console.log%28%27Will+not+be+displayed%27%29%3B%0A++%7D+catch+%28error%29+%7B%0A++++console.log%28error%29%3B++++++++++++++++%2F%2F+-%3E+Error%3A+Error%21%2C+after+5+sec.%0A++%7D%0A%7D%29%28%29%3B) with async functions:
```js
function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

async function sleepRandom(time) {
  await delay(time * 1e3);
  return 0 | Math.random() * 1e3;
}

async function sleepError(time, msg) {
  await delay(time * 1e3);
  throw new Error(msg);
}

(async () => {
  try {
    console.log('Run');                // -> Run
    console.log(await sleepRandom(5)); // -> 936, after 5 sec.
    let [a, b, c] = await Promise.all([
      sleepRandom(5),
      sleepRandom(15),
      sleepRandom(10),
    ]);
    console.log(a, b, c);              // -> 210 445 71, after 15 sec.
    await sleepError(5, 'Error!');
    console.log('Will not be displayed');
  } catch (error) {
    console.log(error);                // -> Error: Error!, after 5 sec.
  }
})();
```

##### Unhandled rejection tracking[⬆](#index)

In Node.js, as with the native implementation, the [`unhandledRejection`](https://nodejs.org/api/process.html#process_event_unhandledrejection) and [`rejectionHandled`](https://nodejs.org/api/process.html#process_event_rejectionhandled) events are available:
```js
process.on('unhandledRejection', (reason, promise) => console.log('unhandled', reason, promise));
process.on('rejectionHandled', promise => console.log('handled', promise));

let promise = Promise.reject(42);
// -> unhandled 42 [object Promise]

// eslint-disable-next-line promise/prefer-await-to-then -- example
setTimeout(() => promise.catch(() => { /* empty */ }), 1e3);
// -> handled [object Promise]
```
In a browser, an unhandled rejection is reported to the console by default; you can also add handlers for unhandled and later handled rejections, [*examples*](https://core-js.io/playground#code=globalThis.addEventListener%28%27unhandledrejection%27%2C+e+%3D%3E+console.log%28%27unhandled%27%2C+e.reason%2C+e.promise%29%29%3B%0AglobalThis.addEventListener%28%27rejectionhandled%27%2C+e+%3D%3E+console.log%28%27handled%27%2C+e.reason%2C+e.promise%29%29%3B%0A%2F%2F+or%0AglobalThis.onunhandledrejection+%3D+e+%3D%3E+console.log%28%27unhandled%27%2C+e.reason%2C+e.promise%29%3B%0AglobalThis.onrejectionhandled+%3D+e+%3D%3E+console.log%28%27handled%27%2C+e.reason%2C+e.promise%29%3B%0A%0Alet+promise+%3D+Promise.reject%2842%29%3B%0A%2F%2F+-%3E+unhandled+42+%5Bobject+Promise%5D%0A%0A%2F%2F+eslint-disable-next-line+promise%2Fprefer-await-to-then+--+example%0AsetTimeout%28%28%29+%3D%3E+promise.catch%28%28%29+%3D%3E+%7B+%2F%2A+empty+%2A%2F+%7D%29%2C+1e3%29%3B%0A%2F%2F+-%3E+handled+42+%5Bobject+Promise%5D):
```js
globalThis.addEventListener('unhandledrejection', e => console.log('unhandled', e.reason, e.promise));
globalThis.addEventListener('rejectionhandled', e => console.log('handled', e.reason, e.promise));
// or
globalThis.onunhandledrejection = e => console.log('unhandled', e.reason, e.promise);
globalThis.onrejectionhandled = e => console.log('handled', e.reason, e.promise);

let promise = Promise.reject(42);
// -> unhandled 42 [object Promise]

// eslint-disable-next-line promise/prefer-await-to-then -- example
setTimeout(() => promise.catch(() => { /* empty */ }), 1e3);
// -> handled 42 [object Promise]
```

#### ECMAScript: Symbol[⬆](#index)
Modules [`es.symbol.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.constructor.js), [`es.symbol.for`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.for.js), [`es.symbol.key-for`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.key-for.js), [`es.symbol.async-dispose`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.async-dispose.js), [`es.symbol.async-iterator`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.async-iterator.js), [`es.symbol.description`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.description.js), [`es.symbol.dispose`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.dispose.js), [`es.symbol.has-instance`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.has-instance.js), [`es.symbol.is-concat-spreadable`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.is-concat-spreadable.js), [`es.symbol.iterator`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.iterator.js), [`es.symbol.match`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.match.js), [`es.symbol.match-all`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.match-all.js), [`es.symbol.replace`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.replace.js), [`es.symbol.search`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.search.js), [`es.symbol.species`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.species.js), [`es.symbol.split`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.split.js), [`es.symbol.to-primitive`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.to-primitive.js), [`es.symbol.to-string-tag`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.to-string-tag.js), [`es.symbol.unscopables`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.unscopables.js), [`es.object.get-own-property-symbols`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.get-own-property-symbols.js).
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
  static matchAll: @@matchAll;
  static replace: @@replace;
  static search: @@search;
  static species: @@species;
  static split: @@split;
  static toPrimitive: @@toPrimitive;
  static toStringTag: @@toStringTag;
  static unscopables: @@unscopables;
  static for(key: string): symbol;
  static keyFor(sym: symbol): string | void;
}

class Object {
  static getOwnPropertySymbols(object: any): Array<symbol>;
}
```
Some methods are also wrapped to work correctly with the `Symbol` polyfill.
```ts
class Object {
  static create(prototype: Object | null, properties?: { [property: PropertyKey]: PropertyDescriptor }): Object;
  static defineProperties(object: Object, properties: { [property: PropertyKey]: PropertyDescriptor }): Object;
  static defineProperty(object: Object, property: PropertyKey, attributes: PropertyDescriptor): Object;
  static getOwnPropertyDescriptor(object: any, property: PropertyKey): PropertyDescriptor | void;
  static getOwnPropertyNames(object: any): Array<string>;
  propertyIsEnumerable(key: PropertyKey): boolean;
}
```
[*CommonJS entry points:*](#commonjs-api)
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
core-js(-pure)/es|stable|actual|full/symbol/match-all
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
[*Basic example*](https://core-js.io/playground#code=let+Person+%3D+%28%28%29+%3D%3E+%7B%0A++let+NAME+%3D+Symbol%28%27name%27%29%3B%0A++return+class+%7B%0A++++constructor%28name%29+%7B%0A++++++this%5BNAME%5D+%3D+name%3B%0A++++%7D%0A++++getName%28%29+%7B%0A++++++return+this%5BNAME%5D%3B%0A++++%7D%0A++%7D%3B%0A%7D%29%28%29%3B%0A%0Alet+person+%3D+new+Person%28%27Vasya%27%29%3B%0Aperson.getName%28%29%3B+++++++++++++++++++++++++%2F%2F+%3D%3E+%27Vasya%27%0Aperson.name%3B++++++++++++++++++++++++++++++%2F%2F+%3D%3E+undefined%0Aperson%5BSymbol%28%27name%27%29%5D%3B+++++++++++++++++++%2F%2F+%3D%3E+undefined%2C+symbols+are+unique%0Afor+%28let+key+in+person%29+console.log%28key%29%3B+%2F%2F+-%3E+nothing%2C+for-in+skips+symbol+keys):
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
person.getName();                         // => 'Vasya'
person.name;                              // => undefined
person[Symbol('name')];                   // => undefined, symbols are unique
for (let key in person) console.log(key); // -> nothing, for-in skips symbol keys
```
`Symbol.for` & `Symbol.keyFor` [*examples*](https://core-js.io/playground#code=let+symbol+%3D+Symbol.for%28%27key%27%29%3B%0Asymbol+%3D%3D%3D+Symbol.for%28%27key%27%29%3B+%2F%2F+%3D%3E+true%0ASymbol.keyFor%28symbol%29%3B++++++++%2F%2F+%3D%3E+%27key%27):
```js
let symbol = Symbol.for('key');
symbol === Symbol.for('key'); // => true
Symbol.keyFor(symbol);        // => 'key'
```
[*Examples*](https://core-js.io/playground#code=let+object+%3D+%7B+a%3A+1+%7D%3B%0AObject.defineProperty%28object%2C+%27b%27%2C+%7B+value%3A+2+%7D%29%3B%0Aobject%5BSymbol%28%27c%27%29%5D+%3D+3%3B%0AObject.keys%28object%29%3B++++++++++++++++++%2F%2F+%3D%3E+%5B%27a%27%5D%0AObject.getOwnPropertyNames%28object%29%3B+++%2F%2F+%3D%3E+%5B%27a%27%2C+%27b%27%5D%0AObject.getOwnPropertySymbols%28object%29%3B+%2F%2F+%3D%3E+%5BSymbol%28c%29%5D%0AReflect.ownKeys%28object%29%3B++++++++++++++%2F%2F+%3D%3E+%5B%27a%27%2C+%27b%27%2C+Symbol%28c%29%5D) with methods for getting own object keys:
```js
let object = { a: 1 };
Object.defineProperty(object, 'b', { value: 2 });
object[Symbol('c')] = 3;
Object.keys(object);                  // => ['a']
Object.getOwnPropertyNames(object);   // => ['a', 'b']
Object.getOwnPropertySymbols(object); // => [Symbol(c)]
Reflect.ownKeys(object);              // => ['a', 'b', Symbol(c)]
```

[*Symbol#description getter*](https://core-js.io/playground#code=Symbol%28%27foo%27%29.description%3B+%2F%2F+%3D%3E+%27foo%27%0A%2F%2F+eslint-disable-next-line+symbol-description+--+example%0ASymbol%28%29.description%3B++++++%2F%2F+%3D%3E+undefined):
```js
Symbol('foo').description; // => 'foo'
// eslint-disable-next-line symbol-description -- example
Symbol().description;      // => undefined
```

> [!WARNING]
> - We can't add a new primitive type, `Symbol` returns an object.
> - `Symbol.for` and `Symbol.keyFor` can't be polyfilled cross-realm.
> - `Symbol` polyfill defines setter in `Object.prototype`. For this reason, uncontrolled creation of symbols can cause memory leak and the `in` operator does not work correctly with the `Symbol` polyfill: `Symbol() in {} // => true`.
> - `core-js` does not add setters to `Object.prototype` for well-known symbols, so that something like `Symbol.iterator in foo` works correctly. It can cause problems with their enumerability.
> - Some problems are possible with environment exotic objects (for example, IE `localStorage`).

#### ECMAScript: Collections[⬆](#index)
`core-js` uses native collections in most cases and only fixes methods / constructors where required; in old environments, it uses a fast polyfill (O(1) lookup).
##### Map[⬆](#index)
Modules [`es.map.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.map.constructor.js), [`es.map.species`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.map.species.js), [`es.map.group-by`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.map.group-by.js), [`es.map.get-or-insert`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.map.get-or-insert.js) and [`es.map.get-or-insert-computed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.map.get-or-insert-computed.js).
```ts
class Map {
  constructor(iterable?: Iterable<[key, value]>): Map;
  clear(): void;
  delete(key: any): boolean;
  forEach(callbackfn: (value: any, key: any, target: any) => void, thisArg?: any): void;
  get(key: any): any;
  getOrInsert(key: any, value: any): any;
  getOrInsertComputed(key: any, callbackfn: (key: any) => any): any;
  has(key: any): boolean;
  set(key: any, val: any): this;
  values(): Iterator<value>;
  keys(): Iterator<key>;
  entries(): Iterator<[key, value]>;
  @@iterator(): Iterator<[key, value]>;
  readonly attribute size: number;
  static groupBy(items: Iterable, callbackfn: (value: any, index: number) => key): Map<key, Array<mixed>>;
  static getter @@species: this;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/map
core-js(-pure)/es|stable|actual|full/map/group-by
core-js(-pure)/es|stable|actual|full/map/get-or-insert
core-js(-pure)/es|stable|actual|full/map/get-or-insert-computed
```
[*Examples*](https://core-js.io/playground#code=let+array+%3D+%5B1%5D%3B%0A%0Alet+map+%3D+new+Map%28%5B%5B%27a%27%2C+1%5D%2C+%5B42%2C+2%5D%5D%29%3B%0Amap.set%28array%2C+3%29.set%28true%2C+4%29%3B%0A%0Amap.size%3B++++++++%2F%2F+%3D%3E+4%0Amap.has%28array%29%3B++%2F%2F+%3D%3E+true%0Amap.has%28%5B1%5D%29%3B++++%2F%2F+%3D%3E+false%0Amap.get%28array%29%3B++%2F%2F+%3D%3E+3%0Amap.forEach%28%28val%2C+key%29+%3D%3E+%7B%0A++console.log%28val%29%3B+++++++++++%2F%2F+-%3E+1%2C+2%2C+3%2C+4%0A++console.log%28key%29%3B+++++++++++%2F%2F+-%3E+%27a%27%2C+42%2C+%5B1%5D%2C+true%0A%7D%29%3B%0Amap.delete%28array%29%3B%0Amap.size%3B++++++++%2F%2F+%3D%3E+3%0Amap.get%28array%29%3B++%2F%2F+%3D%3E+undefined%0AArray.from%28map%29%3B+%2F%2F+%3D%3E+%5B%5B%27a%27%2C+1%5D%2C+%5B42%2C+2%5D%2C+%5Btrue%2C+4%5D%5D%0A%0Amap+%3D+new+Map%28%5B%5B%27a%27%2C+1%5D%2C+%5B%27b%27%2C+2%5D%2C+%5B%27c%27%2C+3%5D%5D%29%3B%0A%0Afor+%28let+%5Bkey%2C+value%5D+of+map%29+%7B%0A++console.log%28key%29%3B+++++++++++++++++++++++++++++++++%2F%2F+-%3E+%27a%27%2C+%27b%27%2C+%27c%27%0A++console.log%28value%29%3B+++++++++++++++++++++++++++++++%2F%2F+-%3E+1%2C+2%2C+3%0A%7D%0Afor+%28let+value+of+map.values%28%29%29+console.log%28value%29%3B+%2F%2F+-%3E+1%2C+2%2C+3%0Afor+%28let+key+of+map.keys%28%29%29+console.log%28key%29%3B+++++++%2F%2F+-%3E+%27a%27%2C+%27b%27%2C+%27c%27%0Afor+%28let+%5Bkey%2C+value%5D+of+map.entries%28%29%29+%7B%0A++console.log%28key%29%3B+++++++++++++++++++++++++++++++++%2F%2F+-%3E+%27a%27%2C+%27b%27%2C+%27c%27%0A++console.log%28value%29%3B+++++++++++++++++++++++++++++++%2F%2F+-%3E+1%2C+2%2C+3%0A%7D%0A%0Amap+%3D+Map.groupBy%28%5B1%2C+2%2C+3%2C+4%2C+5%5D%2C+it+%3D%3E+it+%25+2%29%3B%0Amap.get%281%29%3B+%2F%2F+%3D%3E+%5B1%2C+3%2C+5%5D%0Amap.get%280%29%3B+%2F%2F+%3D%3E+%5B2%2C+4%5D%0A%0Amap+%3D+new+Map%28%5B%5B%27a%27%2C+1%5D%5D%29%3B%0A%0Amap.getOrInsert%28%27a%27%2C+2%29%3B+%2F%2F+%3D%3E+1%0A%0Amap.getOrInsert%28%27b%27%2C+3%29%3B+%2F%2F+%3D%3E+3%0A%0Amap.getOrInsertComputed%28%27a%27%2C+key+%3D%3E+key%29%3B+%2F%2F+%3D%3E+1%0A%0Amap.getOrInsertComputed%28%27c%27%2C+key+%3D%3E+key%29%3B+%2F%2F+%3D%3E+%27c%27%0A%0Amap%3B+%2F%2F+%3D%3E+Map+%7B+%27a%27+%3D%3E+1%2C+%27b%27+%3D%3E+3%2C+%27c%27+%3D%3E+%27c%27+%7D):
```js
let array = [1];

let map = new Map([['a', 1], [42, 2]]);
map.set(array, 3).set(true, 4);

map.size;        // => 4
map.has(array);  // => true
map.has([1]);    // => false
map.get(array);  // => 3
map.forEach((val, key) => {
  console.log(val);           // -> 1, 2, 3, 4
  console.log(key);           // -> 'a', 42, [1], true
});
map.delete(array);
map.size;        // => 3
map.get(array);  // => undefined
Array.from(map); // => [['a', 1], [42, 2], [true, 4]]

map = new Map([['a', 1], ['b', 2], ['c', 3]]);

for (let [key, value] of map) {
  console.log(key);                                 // -> 'a', 'b', 'c'
  console.log(value);                               // -> 1, 2, 3
}
for (let value of map.values()) console.log(value); // -> 1, 2, 3
for (let key of map.keys()) console.log(key);       // -> 'a', 'b', 'c'
for (let [key, value] of map.entries()) {
  console.log(key);                                 // -> 'a', 'b', 'c'
  console.log(value);                               // -> 1, 2, 3
}

map = Map.groupBy([1, 2, 3, 4, 5], it => it % 2);
map.get(1); // => [1, 3, 5]
map.get(0); // => [2, 4]

map = new Map([['a', 1]]);

map.getOrInsert('a', 2); // => 1

map.getOrInsert('b', 3); // => 3

map.getOrInsertComputed('a', key => key); // => 1

map.getOrInsertComputed('c', key => key); // => 'c'

map; // => Map { 'a' => 1, 'b' => 3, 'c' => 'c' }
```

##### Set[⬆](#index)
Modules [`es.set.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.set.constructor.js), [`es.set.species`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.set.species.js), [`es.set.difference`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.set.difference.js), [`es.set.intersection`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.set.intersection.js), [`es.set.is-disjoint-from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.set.is-disjoint-from.js), [`es.set.is-subset-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.set.is-subset-of.js), [`es.set.is-superset-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.set.is-superset-of.js), [`es.set.symmetric-difference`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.set.symmetric-difference.js), [`es.set.union`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.set.union.js).
```ts
class Set {
  constructor(iterable?: Iterable<value>): Set;
  add(key: any): this;
  clear(): void;
  delete(key: any): boolean;
  forEach(callbackfn: (value: any, key: any, target: any) => void, thisArg?: any): void;
  has(key: any): boolean;
  values(): Iterator<value>;
  keys(): Iterator<value>;
  entries(): Iterator<[value, value]>;
  difference(other: SetLike<mixed>): Set;
  intersection(other: SetLike<mixed>): Set;
  isDisjointFrom(other: SetLike<mixed>): boolean;
  isSubsetOf(other: SetLike<mixed>): boolean;
  isSupersetOf(other: SetLike<mixed>): boolean;
  symmetricDifference(other: SetLike<mixed>): Set;
  union(other: SetLike<mixed>): Set;
  @@iterator(): Iterator<value>;
  readonly attribute size: number;
  static getter @@species: this;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/set
core-js(-pure)/es|stable|actual|full/set/difference
core-js(-pure)/es|stable|actual|full/set/intersection
core-js(-pure)/es|stable|actual|full/set/is-disjoint-from
core-js(-pure)/es|stable|actual|full/set/is-subset-of
core-js(-pure)/es|stable|actual|full/set/is-superset-of
core-js(-pure)/es|stable|actual|full/set/symmetric-difference
core-js(-pure)/es|stable|actual|full/set/union
```
[*Examples*](https://core-js.io/playground#code=let+set+%3D+new+Set%28%5B%27a%27%2C+%27b%27%2C+%27a%27%2C+%27c%27%5D%29%3B%0Aset.add%28%27d%27%29.add%28%27b%27%29.add%28%27e%27%29%3B%0Aset.size%3B++++++++%2F%2F+%3D%3E+5%0Aset.has%28%27b%27%29%3B++++%2F%2F+%3D%3E+true%0Aset.forEach%28it+%3D%3E+%7B%0A++console.log%28it%29%3B++++++++++++%2F%2F+-%3E+%27a%27%2C+%27b%27%2C+%27c%27%2C+%27d%27%2C+%27e%27%0A%7D%29%3B%0Aset.delete%28%27b%27%29%3B%0Aset.size%3B++++++++%2F%2F+%3D%3E+4%0Aset.has%28%27b%27%29%3B++++%2F%2F+%3D%3E+false%0AArray.from%28set%29%3B+%2F%2F+%3D%3E+%5B%27a%27%2C+%27c%27%2C+%27d%27%2C+%27e%27%5D%0A%0Aset+%3D+new+Set%28%5B1%2C+2%2C+3%2C+2%2C+1%5D%29%3B%0A%0Afor+%28let+value+of+set%29+console.log%28value%29%3B++++++++++%2F%2F+-%3E+1%2C+2%2C+3%0Afor+%28let+value+of+set.values%28%29%29+console.log%28value%29%3B+%2F%2F+-%3E+1%2C+2%2C+3%0Afor+%28let+key+of+set.keys%28%29%29+console.log%28key%29%3B+++++++%2F%2F+-%3E+1%2C+2%2C+3%0Afor+%28let+%5Bkey%2C+value%5D+of+set.entries%28%29%29+%7B%0A++console.log%28key%29%3B+++++++++++++++++++++++++++++++++%2F%2F+-%3E+1%2C+2%2C+3%0A++console.log%28value%29%3B+++++++++++++++++++++++++++++++%2F%2F+-%3E+1%2C+2%2C+3%0A%7D%0A%0Anew+Set%28%5B1%2C+2%2C+3%5D%29.union%28new+Set%28%5B3%2C+4%2C+5%5D%29%29%3B+++++++++++++++%2F%2F+%3D%3E+Set+%7B+1%2C+2%2C+3%2C+4%2C+5+%7D%0Anew+Set%28%5B1%2C+2%2C+3%5D%29.intersection%28new+Set%28%5B3%2C+4%2C+5%5D%29%29%3B++++++++%2F%2F+%3D%3E+Set+%7B+3+%7D%0Anew+Set%28%5B1%2C+2%2C+3%5D%29.difference%28new+Set%28%5B3%2C+4%2C+5%5D%29%29%3B++++++++++%2F%2F+%3D%3E+Set+%7B+1%2C+2+%7D%0Anew+Set%28%5B1%2C+2%2C+3%5D%29.symmetricDifference%28new+Set%28%5B3%2C+4%2C+5%5D%29%29%3B+%2F%2F+%3D%3E+Set+%7B+1%2C+2%2C+4%2C+5+%7D%0Anew+Set%28%5B1%2C+2%2C+3%5D%29.isDisjointFrom%28new+Set%28%5B4%2C+5%2C+6%5D%29%29%3B++++++%2F%2F+%3D%3E+true%0Anew+Set%28%5B1%2C+2%2C+3%5D%29.isSubsetOf%28new+Set%28%5B5%2C+4%2C+3%2C+2%2C+1%5D%29%29%3B++++%2F%2F+%3D%3E+true%0Anew+Set%28%5B5%2C+4%2C+3%2C+2%2C+1%5D%29.isSupersetOf%28new+Set%28%5B1%2C+2%2C+3%5D%29%29%3B++%2F%2F+%3D%3E+true):
```js
let set = new Set(['a', 'b', 'a', 'c']);
set.add('d').add('b').add('e');
set.size;        // => 5
set.has('b');    // => true
set.forEach(it => {
  console.log(it);            // -> 'a', 'b', 'c', 'd', 'e'
});
set.delete('b');
set.size;        // => 4
set.has('b');    // => false
Array.from(set); // => ['a', 'c', 'd', 'e']

set = new Set([1, 2, 3, 2, 1]);

for (let value of set) console.log(value);          // -> 1, 2, 3
for (let value of set.values()) console.log(value); // -> 1, 2, 3
for (let key of set.keys()) console.log(key);       // -> 1, 2, 3
for (let [key, value] of set.entries()) {
  console.log(key);                                 // -> 1, 2, 3
  console.log(value);                               // -> 1, 2, 3
}

new Set([1, 2, 3]).union(new Set([3, 4, 5]));               // => Set { 1, 2, 3, 4, 5 }
new Set([1, 2, 3]).intersection(new Set([3, 4, 5]));        // => Set { 3 }
new Set([1, 2, 3]).difference(new Set([3, 4, 5]));          // => Set { 1, 2 }
new Set([1, 2, 3]).symmetricDifference(new Set([3, 4, 5])); // => Set { 1, 2, 4, 5 }
new Set([1, 2, 3]).isDisjointFrom(new Set([4, 5, 6]));      // => true
new Set([1, 2, 3]).isSubsetOf(new Set([5, 4, 3, 2, 1]));    // => true
new Set([5, 4, 3, 2, 1]).isSupersetOf(new Set([1, 2, 3]));  // => true
```
##### WeakMap[⬆](#index)
Modules [`es.weak-map.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.weak-map.constructor.js), [`es.weak-map.get-or-insert`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.weak-map.get-or-insert.js) and [`es.weak-map.get-or-insert-computed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.weak-map.get-or-insert-computed.js).
```ts
class WeakMap {
  constructor(iterable?: Iterable<[key, value]>): WeakMap;
  delete(key: object | symbol): boolean;
  get(key: object | symbol): any;
  getOrInsert(key: object | symbol, value: any): any;
  getOrInsertComputed(key: object | symbol, callbackfn: (key: any) => any): any;
  has(key: object | symbol): boolean;
  set(key: object | symbol, val: any): this;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/weak-map
core-js(-pure)/es|stable|actual|full/weak-map/get-or-insert
core-js(-pure)/es|stable|actual|full/weak-map/get-or-insert-computed
```
[*Examples*](https://core-js.io/playground#code=let+a+%3D+%5B1%5D%3B%0Alet+b+%3D+%5B2%5D%3B%0Alet+c+%3D+%5B3%5D%3B%0A%0Alet+weakmap+%3D+new+WeakMap%28%5B%5Ba%2C+1%5D%2C+%5Bb%2C+2%5D%5D%29%3B%0Aweakmap.set%28c%2C+3%29.set%28b%2C+4%29%3B%0Aweakmap.has%28a%29%3B+++%2F%2F+%3D%3E+true%0Aweakmap.has%28%5B1%5D%29%3B+%2F%2F+%3D%3E+false%0Aweakmap.get%28a%29%3B+++%2F%2F+%3D%3E+1%0Aweakmap.delete%28a%29%3B%0Aweakmap.get%28a%29%3B+++%2F%2F+%3D%3E+undefined%0A%0A%2F%2F+Private+properties+store%3A%0Alet+Person+%3D+%28%28%29+%3D%3E+%7B%0A++let+names+%3D+new+WeakMap%28%29%3B%0A++return+class+%7B%0A++++constructor%28name%29+%7B%0A++++++names.set%28this%2C+name%29%3B%0A++++%7D%0A++++getName%28%29+%7B%0A++++++return+names.get%28this%29%3B%0A++++%7D%0A++%7D%3B%0A%7D%29%28%29%3B%0A%0Alet+person+%3D+new+Person%28%27Vasya%27%29%3B%0Aperson.getName%28%29%3B++++++++++++%2F%2F+%3D%3E+%27Vasya%27):
```js
let a = [1];
let b = [2];
let c = [3];

let weakmap = new WeakMap([[a, 1], [b, 2]]);
weakmap.set(c, 3).set(b, 4);
weakmap.has(a);   // => true
weakmap.has([1]); // => false
weakmap.get(a);   // => 1
weakmap.delete(a);
weakmap.get(a);   // => undefined

// Private properties store:
let Person = (() => {
  let names = new WeakMap();
  return class {
    constructor(name) {
      names.set(this, name);
    }
    getName() {
      return names.get(this);
    }
  };
})();

let person = new Person('Vasya');
person.getName();            // => 'Vasya'
```
##### WeakSet[⬆](#index)
Modules [`es.weak-set.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.weak-set.constructor.js).
```ts
class WeakSet {
  constructor(iterable?: Iterable<value>): WeakSet;
  add(key: object | symbol): this;
  delete(key: object | symbol): boolean;
  has(key: object | symbol): boolean;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/weak-set
```
[*Examples*](https://core-js.io/playground#code=let+a+%3D+%5B1%5D%3B%0Alet+b+%3D+%5B2%5D%3B%0Alet+c+%3D+%5B3%5D%3B%0A%0Alet+weakset+%3D+new+WeakSet%28%5Ba%2C+b%2C+a%5D%29%3B%0Aweakset.add%28c%29.add%28b%29.add%28c%29%3B%0Aweakset.has%28b%29%3B+++%2F%2F+%3D%3E+true%0Aweakset.has%28%5B2%5D%29%3B+%2F%2F+%3D%3E+false%0Aweakset.delete%28b%29%3B%0Aweakset.has%28b%29%3B+++%2F%2F+%3D%3E+false):
```js
let a = [1];
let b = [2];
let c = [3];

let weakset = new WeakSet([a, b, a]);
weakset.add(c).add(b).add(c);
weakset.has(b);   // => true
weakset.has([2]); // => false
weakset.delete(b);
weakset.has(b);   // => false
```

> [!WARNING]
> - Weak-collections polyfill stores values as hidden properties of keys. It works correctly and does not leak in most cases. However, it is desirable to store a collection longer than its keys.
> - Native symbols as `WeakMap` keys can't be properly polyfilled without memory leaks.

#### ECMAScript: Explicit resource management[⬆](#index)
> [!NOTE]
> These are only built-ins for Explicit Resource Management; the `using` syntax requires [transpiler support](https://babeljs.io/docs/babel-plugin-transform-explicit-resource-management).

> [!WARNING]
> By default, `core-js` has no access to the real `%AsyncIteratorPrototype%`, so in engines without native support, async generator objects do not get `@@asyncDispose`. To fix it, set the `USE_FUNCTION_CONSTRUCTOR` option of `core-js/configurator` to `true` or pass `%AsyncIteratorPrototype%` to it as the `AsyncIteratorPrototype` option, see [`AsyncIterator` helpers caveats](#caveats).

Modules [`es.disposable-stack.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.disposable-stack.constructor.js), [`es.iterator.dispose`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.dispose.js), [`es.async-disposable-stack.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.async-disposable-stack.constructor.js), [`es.async-iterator.async-dispose`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.async-iterator.async-dispose.js), [`es.suppressed-error.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.suppressed-error.constructor.js), [`es.symbol.async-dispose`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.async-dispose.js), [`es.symbol.dispose`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.dispose.js).
```ts
class Symbol {
  static asyncDispose: @@asyncDispose;
  static dispose: @@dispose;
}

class DisposableStack {
  constructor(): DisposableStack;
  readonly attribute disposed: boolean;
  dispose(): undefined;
  use(value: Disposable | null | undefined): value;
  adopt(value: any, onDispose: Function): value;
  defer(onDispose: Function): undefined;
  move(): DisposableStack;
  @@dispose(): undefined;
  @@toStringTag: 'DisposableStack';
}

class AsyncDisposableStack {
  constructor(): AsyncDisposableStack;
  readonly attribute disposed: boolean;
  disposeAsync(): Promise<undefined>;
  use(value: AsyncDisposable | Disposable | null | undefined): value;
  adopt(value: any, onDispose: Function): value;
  defer(onDispose: Function): undefined;
  move(): AsyncDisposableStack;
  @@asyncDispose(): Promise<undefined>;
  @@toStringTag: 'AsyncDisposableStack';
}

class SuppressedError extends Error {
  constructor(error: any, suppressed: any, message?: string): SuppressedError;
  error: any;
  suppressed: any;
  message: string;
}

class Iterator {
  @@dispose(): undefined;
}

class AsyncIterator {
  @@asyncDispose(): Promise<undefined>;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/disposable-stack
core-js(-pure)/es|stable|actual|full/disposable-stack/constructor
core-js(-pure)/es|stable|actual|full/async-disposable-stack
core-js(-pure)/es|stable|actual|full/async-disposable-stack/constructor
core-js(-pure)/es|stable|actual|full/async-iterator
core-js(-pure)/es|stable|actual|full/suppressed-error
core-js(-pure)/es|stable|actual|full/symbol/async-dispose
core-js(-pure)/es|stable|actual|full/symbol/dispose
```
[*Examples*](https://core-js.io/playground#code=const+stack+%3D+new+DisposableStack%28%29%3B%0Astack.use%28%7B%0A++%5BSymbol.dispose%5D%28%29+%7B%0A++++console.log%28%27resource+disposed%27%29%3B%0A++%7D%2C%0A%7D%29%3B%0Astack.defer%28%28%29+%3D%3E+console.log%28%27deferred+cleanup%27%29%29%3B%0Astack.adopt%2842%2C+value+%3D%3E+console.log%28%60%24%7B+value+%7D+released%60%29%29%3B%0A%0Astack.disposed%3B+%2F%2F+%3D%3E+false%0Astack.dispose%28%29%3B+%2F%2F+-%3E+%2742+released%27%2C+%27deferred+cleanup%27%2C+%27resource+disposed%27%0Astack.disposed%3B+%2F%2F+%3D%3E+true%0A%0Aconst+failing+%3D+new+DisposableStack%28%29%3B%0Afailing.defer%28%28%29+%3D%3E+%7B%0A++throw+new+Error%28%27first%27%29%3B%0A%7D%29%3B%0Afailing.defer%28%28%29+%3D%3E+%7B%0A++throw+new+Error%28%27second%27%29%3B%0A%7D%29%3B%0Atry+%7B%0A++failing.dispose%28%29%3B%0A%7D+catch+%28error%29+%7B%0A++error+instanceof+SuppressedError%3B+%2F%2F+%3D%3E+true%0A++error.error.message%3B++++++++++++++%2F%2F+%3D%3E+%27first%27%0A++error.suppressed.message%3B+++++++++%2F%2F+%3D%3E+%27second%27%0A%7D%0A%0Aconst+asyncStack+%3D+new+AsyncDisposableStack%28%29%3B%0AasyncStack.defer%28async+%28%29+%3D%3E+console.log%28%27async+cleanup%27%29%29%3B%0Aawait+asyncStack.disposeAsync%28%29%3B+%2F%2F+-%3E+%27async+cleanup%27%0A%0Afunction+%2A+gen%28%29+%7B%0A++try+%7B%0A++++yield+1%3B%0A++%7D+finally+%7B%0A++++console.log%28%27iterator+closed%27%29%3B%0A++%7D%0A%7D%0Aconst+iterator+%3D+gen%28%29%3B%0Aiterator.next%28%29%3B%0Aiterator%5BSymbol.dispose%5D%28%29%3B+%2F%2F+-%3E+%27iterator+closed%27):
```js
const stack = new DisposableStack();
stack.use({
  [Symbol.dispose]() {
    console.log('resource disposed');
  },
});
stack.defer(() => console.log('deferred cleanup'));
stack.adopt(42, value => console.log(`${ value } released`));

stack.disposed; // => false
stack.dispose(); // -> '42 released', 'deferred cleanup', 'resource disposed'
stack.disposed; // => true

const failing = new DisposableStack();
failing.defer(() => {
  throw new Error('first');
});
failing.defer(() => {
  throw new Error('second');
});
try {
  failing.dispose();
} catch (error) {
  error instanceof SuppressedError; // => true
  error.error.message;              // => 'first'
  error.suppressed.message;         // => 'second'
}

const asyncStack = new AsyncDisposableStack();
asyncStack.defer(async () => console.log('async cleanup'));
await asyncStack.disposeAsync(); // -> 'async cleanup'

function * gen() {
  try {
    yield 1;
  } finally {
    console.log('iterator closed');
  }
}
const iterator = gen();
iterator.next();
iterator[Symbol.dispose](); // -> 'iterator closed'
```

#### ECMAScript: Typed arrays[⬆](#index)
Implementations and fixes for `ArrayBuffer`, `DataView`, Typed Arrays constructors, static and prototype methods. Typed arrays work only in environments with support for descriptors (IE9+), `ArrayBuffer` and `DataView` should work anywhere.

Modules [`es.array-buffer.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array-buffer.constructor.js), [`es.array-buffer.is-view`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array-buffer.is-view.js), [`es.array-buffer.detached`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array-buffer.detached.js), [`es.array-buffer.slice`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array-buffer.slice.js), [`es.array-buffer.species`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array-buffer.species.js), [`es.array-buffer.to-string-tag`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array-buffer.to-string-tag.js), [`es.array-buffer.transfer`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array-buffer.transfer.js), [`es.array-buffer.transfer-to-fixed-length`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array-buffer.transfer-to-fixed-length.js), [`es.data-view.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.data-view.constructor.js), [`es.data-view.set-int8`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.data-view.set-int8.js), [`es.data-view.set-uint8`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.data-view.set-uint8.js), [`es.data-view.get-float16`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.data-view.get-float16.js), [`es.data-view.set-float16`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.data-view.set-float16.js), [`es.data-view.to-string-tag`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.data-view.to-string-tag.js), [`es.typed-array.int8-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.int8-array.js), [`es.typed-array.uint8-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.uint8-array.js), [`es.typed-array.uint8-clamped-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.uint8-clamped-array.js), [`es.typed-array.int16-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.int16-array.js), [`es.typed-array.uint16-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.uint16-array.js), [`es.typed-array.int32-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.int32-array.js), [`es.typed-array.uint32-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.uint32-array.js), [`es.typed-array.float32-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.float32-array.js), [`es.typed-array.float64-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.float64-array.js), [`es.typed-array.copy-within`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.copy-within.js), [`es.typed-array.entries`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.entries.js), [`es.typed-array.every`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.every.js), [`es.typed-array.fill`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.fill.js), [`es.typed-array.filter`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.filter.js), [`es.typed-array.find`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.find.js), [`es.typed-array.find-index`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.find-index.js), [`es.typed-array.find-last`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.find-last.js), [`es.typed-array.find-last-index`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.find-last-index.js), [`es.typed-array.for-each`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.for-each.js), [`es.typed-array.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.from.js), [`es.typed-array.includes`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.includes.js), [`es.typed-array.index-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.index-of.js), [`es.typed-array.iterator`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.iterator.js), [`es.typed-array.keys`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.keys.js), [`es.typed-array.join`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.join.js), [`es.typed-array.last-index-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.last-index-of.js), [`es.typed-array.map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.map.js), [`es.typed-array.of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.of.js), [`es.typed-array.reduce`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.reduce.js), [`es.typed-array.reduce-right`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.reduce-right.js), [`es.typed-array.reverse`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.reverse.js), [`es.typed-array.set`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.set.js), [`es.typed-array.slice`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.slice.js), [`es.typed-array.some`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.some.js), [`es.typed-array.sort`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.sort.js), [`es.typed-array.subarray`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.subarray.js), [`es.typed-array.to-locale-string`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.to-locale-string.js), [`es.typed-array.to-string`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.to-string.js), [`es.typed-array.to-string-tag`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.to-string-tag.js), [`es.typed-array.at`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.at.js), [`es.typed-array.to-reversed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.to-reversed.js), [`es.typed-array.to-sorted`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.to-sorted.js), [`es.typed-array.values`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.values.js), [`es.typed-array.with`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.with.js), [`es.uint8-array.from-base64`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.uint8-array.from-base64.js), [`es.uint8-array.from-hex`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.uint8-array.from-hex.js), [`es.uint8-array.set-from-base64`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.uint8-array.set-from-base64.js), [`es.uint8-array.set-from-hex`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.uint8-array.set-from-hex.js), [`es.uint8-array.to-base64`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.uint8-array.to-base64.js), [`es.uint8-array.to-hex`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.uint8-array.to-hex.js).

```ts
class ArrayBuffer {
  constructor(length: any): ArrayBuffer;
  readonly attribute byteLength: number;
  readonly attribute detached: boolean;
  readonly attribute @@toStringTag: 'ArrayBuffer';
  slice(start?: any, end?: any): ArrayBuffer;
  transfer(newLength?: number): ArrayBuffer;
  transferToFixedLength(newLength?: number): ArrayBuffer;
  static isView(arg: any): boolean;
  static getter @@species: this;
}

class DataView {
  constructor(buffer: ArrayBuffer, byteOffset?: number, byteLength?: number): DataView;
  getInt8(offset: any): int8;
  getUint8(offset: any): uint8;
  getInt16(offset: any, littleEndian?: boolean = false): int16;
  getUint16(offset: any, littleEndian?: boolean = false): uint16;
  getInt32(offset: any, littleEndian?: boolean = false): int32;
  getUint32(offset: any, littleEndian?: boolean = false): uint32;
  getFloat16(offset: any, littleEndian?: boolean = false): float16;
  getFloat32(offset: any, littleEndian?: boolean = false): float32;
  getFloat64(offset: any, littleEndian?: boolean = false): float64;
  setInt8(offset: any, value: any): void;
  setUint8(offset: any, value: any): void;
  setInt16(offset: any, value: any, littleEndian?: boolean = false): void;
  setUint16(offset: any, value: any, littleEndian?: boolean = false): void;
  setInt32(offset: any, value: any, littleEndian?: boolean = false): void;
  setUint32(offset: any, value: any, littleEndian?: boolean = false): void;
  setFloat16(offset: any, value: any, littleEndian?: boolean = false): void;
  setFloat32(offset: any, value: any, littleEndian?: boolean = false): void;
  setFloat64(offset: any, value: any, littleEndian?: boolean = false): void;
  readonly attribute buffer: ArrayBuffer;
  readonly attribute byteLength: number;
  readonly attribute byteOffset: number;
  readonly attribute @@toStringTag: 'DataView';
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
  constructor(buffer: ArrayBuffer, byteOffset?: number, length?: number): %TypedArray%;
  BYTES_PER_ELEMENT: number;
  static BYTES_PER_ELEMENT: number;
}

class %TypedArray% {
  at(index: int): number | void;
  copyWithin(target: number, start: number, end?: number): this;
  entries(): Iterator<[index, value]>;
  every(callbackfn: (value: number, index: number, target: %TypedArray%) => boolean, thisArg?: any): boolean;
  fill(value: number, start?: number, end?: number): this;
  filter(callbackfn: (value: number, index: number, target: %TypedArray%) => boolean, thisArg?: any): %TypedArray%;
  find(callbackfn: (value: number, index: number, target: %TypedArray%) => boolean, thisArg?: any): any;
  findIndex(callbackfn: (value: number, index: number, target: %TypedArray%) => boolean, thisArg?: any): number;
  findLast(callbackfn: (value: any, index: number, target: %TypedArray%) => boolean, thisArg?: any): any;
  findLastIndex(callbackfn: (value: any, index: number, target: %TypedArray%) => boolean, thisArg?: any): number;
  forEach(callbackfn: (value: number, index: number, target: %TypedArray%) => void, thisArg?: any): void;
  includes(searchElement: any, from?: number): boolean;
  indexOf(searchElement: any, from?: number): number;
  join(separator: string = ','): string;
  keys(): Iterator<index>;
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
  toReversed(): %TypedArray%;
  toSorted(comparefn?: (a: any, b: any) => number): %TypedArray%;
  toString(): string;
  toLocaleString(): string;
  values(): Iterator<value>;
  with(index: int, value: any): %TypedArray%;
  @@iterator(): Iterator<value>;
  readonly attribute buffer: ArrayBuffer;
  readonly attribute byteLength: number;
  readonly attribute byteOffset: number;
  readonly attribute length: number;
  readonly attribute @@toStringTag: string;
  static from(items: Iterable | ArrayLike, mapFn?: (value: any, index: number) => any, thisArg?: any): %TypedArray%;
  static of(...args: Array<mixed>): %TypedArray%;
  static getter @@species: this;
}

class Uint8Array {
  static fromBase64(string: string, options?: { alphabet?: 'base64' | 'base64url', lastChunkHandling?: 'loose' | 'strict' | 'stop-before-partial' }): Uint8Array;
  static fromHex(string: string): Uint8Array;
  setFromBase64(string: string, options?: { alphabet?: 'base64' | 'base64url', lastChunkHandling?: 'loose' | 'strict' | 'stop-before-partial' }): { read: uint, written: uint };
  setFromHex(string: string): { read: uint, written: uint };
  toBase64(options?: { alphabet?: 'base64' | 'base64url', omitPadding?: boolean }): string;
  toHex(): string;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/es|stable|actual|full/array-buffer
core-js/es|stable|actual|full/array-buffer/constructor
core-js/es|stable|actual|full/array-buffer/is-view
core-js/es|stable|actual|full/array-buffer/detached
core-js/es|stable|actual|full/array-buffer/slice
core-js/es|stable|actual|full/array-buffer/transfer
core-js/es|stable|actual|full/array-buffer/transfer-to-fixed-length
core-js/es|stable|actual|full/data-view
core-js/es|stable|actual|full/data-view/get-float16
core-js/es|stable|actual|full/data-view/set-float16
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
core-js/es|stable|actual|full/typed-array/methods
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
core-js/es|stable|actual|full/typed-array/from-base64
core-js/es|stable|actual|full/typed-array/from-hex
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
core-js/es|stable|actual|full/typed-array/set-from-base64
core-js/es|stable|actual|full/typed-array/set-from-hex
core-js/es|stable|actual|full/typed-array/slice
core-js/es|stable|actual|full/typed-array/some
core-js/es|stable|actual|full/typed-array/sort
core-js/es|stable|actual|full/typed-array/subarray
core-js/es|stable|actual|full/typed-array/to-base64
core-js/es|stable|actual|full/typed-array/to-hex
core-js/es|stable|actual|full/typed-array/to-locale-string
core-js/es|stable|actual|full/typed-array/to-reversed
core-js/es|stable|actual|full/typed-array/to-sorted
core-js/es|stable|actual|full/typed-array/to-string
core-js/es|stable|actual|full/typed-array/values
core-js/es|stable|actual|full/typed-array/with
```
[*Examples*](https://core-js.io/playground#code=new+Int32Array%284%29%3B++++++++++++++++++++++++++%2F%2F+%3D%3E+%5B0%2C+0%2C+0%2C+0%5D%0Anew+Uint8ClampedArray%28%5B1%2C+2%2C+3%2C+666%5D%29%3B++++++%2F%2F+%3D%3E+%5B1%2C+2%2C+3%2C+255%5D%0Anew+Float32Array%28new+Set%28%5B1%2C+2%2C+3%2C+2%2C+1%5D%29%29%3B+%2F%2F+%3D%3E+%5B1%2C+2%2C+3%5D%0A%0Alet+buffer+%3D+new+ArrayBuffer%288%29%3B%0Alet+view+%3D+new+DataView%28buffer%29%3B%0Aview.setFloat64%280%2C+123.456%2C+true%29%3B%0Anew+Uint8Array%28buffer.slice%284%29%29%3B+%2F%2F+%3D%3E+%5B47%2C+221%2C+94%2C+64%5D%0A%0AInt8Array.of%281%2C+1.5%2C+5.7%2C+745%29%3B++++++%2F%2F+%3D%3E+%5B1%2C+1%2C+5%2C+-23%5D%0AUint8Array.from%28%5B1%2C+1.5%2C+5.7%2C+745%5D%29%3B+%2F%2F+%3D%3E+%5B1%2C+1%2C+5%2C+233%5D%0A%0Alet+typed+%3D+new+Uint8Array%28%5B1%2C+2%2C+3%5D%29%3B%0A%0Alet+a+%3D+typed.slice%281%29%3B++++%2F%2F+%3D%3E+%5B2%2C+3%5D%0Atyped.buffer+%3D%3D%3D+a.buffer%3B+%2F%2F+%3D%3E+false%0Alet+b+%3D+typed.subarray%281%29%3B+%2F%2F+%3D%3E+%5B2%2C+3%5D%0Atyped.buffer+%3D%3D%3D+b.buffer%3B+%2F%2F+%3D%3E+true%0A%0Atyped.filter%28it+%3D%3E+it+%25+2%29%3B+%2F%2F+%3D%3E+%5B1%2C+3%5D%0Atyped.map%28it+%3D%3E+it+%2A+1.5%29%3B++%2F%2F+%3D%3E+%5B1%2C+3%2C+4%5D%0A%0Afor+%28let+value+of+typed%29+console.log%28value%29%3B++++++++++%2F%2F+-%3E+1%2C+2%2C+3%0Afor+%28let+value+of+typed.values%28%29%29+console.log%28value%29%3B+%2F%2F+-%3E+1%2C+2%2C+3%0Afor+%28let+key+of+typed.keys%28%29%29+console.log%28key%29%3B+++++++%2F%2F+-%3E+0%2C+1%2C+2%0Afor+%28let+%5Bkey%2C+value%5D+of+typed.entries%28%29%29+%7B%0A++console.log%28key%29%3B+++++++++++++++++++++++++++++++++++%2F%2F+-%3E+0%2C+1%2C+2%0A++console.log%28value%29%3B+++++++++++++++++++++++++++++++++%2F%2F+-%3E+1%2C+2%2C+3%0A%7D%0A%0Anew+Int32Array%28%5B1%2C+2%2C+3%5D%29.at%281%29%3B++%2F%2F+%3D%3E+2%0Anew+Int32Array%28%5B1%2C+2%2C+3%5D%29.at%28-1%29%3B+%2F%2F+%3D%3E+3%0A%0Abuffer+%3D+Int8Array.of%281%2C+2%2C+3%2C+4%2C+5%2C+6%2C+7%2C+8%29.buffer%3B%0Abuffer.byteLength%3B+%2F%2F+%3D%3E+8%0Abuffer.detached%3B+%2F%2F+%3D%3E+false%0Aconst+newBuffer+%3D+buffer.transfer%284%29%3B%0Abuffer.byteLength%3B+%2F%2F+%3D%3E+0%0Abuffer.detached%3B+%2F%2F+%3D%3E+true%0AnewBuffer.byteLength%3B+%2F%2F+%3D%3E+4%0AnewBuffer.detached%3B+%2F%2F+%3D%3E+false%0A%5B...new+Int8Array%28newBuffer%29%5D%3B+%2F%2F+%3D%3E+%5B1%2C+2%2C+3%2C+4%5D):
```js
new Int32Array(4);                          // => [0, 0, 0, 0]
new Uint8ClampedArray([1, 2, 3, 666]);      // => [1, 2, 3, 255]
new Float32Array(new Set([1, 2, 3, 2, 1])); // => [1, 2, 3]

let buffer = new ArrayBuffer(8);
let view = new DataView(buffer);
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

for (let value of typed) console.log(value);          // -> 1, 2, 3
for (let value of typed.values()) console.log(value); // -> 1, 2, 3
for (let key of typed.keys()) console.log(key);       // -> 0, 1, 2
for (let [key, value] of typed.entries()) {
  console.log(key);                                   // -> 0, 1, 2
  console.log(value);                                 // -> 1, 2, 3
}

new Int32Array([1, 2, 3]).at(1);  // => 2
new Int32Array([1, 2, 3]).at(-1); // => 3

buffer = Int8Array.of(1, 2, 3, 4, 5, 6, 7, 8).buffer;
buffer.byteLength; // => 8
buffer.detached; // => false
const newBuffer = buffer.transfer(4);
buffer.byteLength; // => 0
buffer.detached; // => true
newBuffer.byteLength; // => 4
newBuffer.detached; // => false
[...new Int8Array(newBuffer)]; // => [1, 2, 3, 4]
```

*Base64 / hex examples*:
```js
let arr = new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]);
arr.toBase64(); // => 'SGVsbG8gV29ybGQ='
arr.toBase64({ omitPadding: true }); // => 'SGVsbG8gV29ybGQ'
arr.toHex(); // => '48656c6c6f20576f726c64'
Uint8Array.fromBase64('SGVsbG8gV29ybGQ='); // => Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100])
Uint8Array.fromHex('48656c6c6f20576f726c64'); // => Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100])
```

> [!WARNING]
> - Polyfills of Typed Arrays constructors work as close to the spec as possible without `Proxy` - integer-indexed exotic behavior, like ignoring out-of-range numeric keys, can't be emulated. Still, because of the internal usage of getters / setters on each instance, they are slow and consume significant memory. However, polyfills of Typed Arrays constructors are required mainly for old IE, all modern engines have native Typed Arrays constructors and require only fixes of constructors and polyfills of methods.
> - `ArrayBuffer.prototype.{ transfer, transferToFixedLength }` are polyfilled only in runtimes with native `structuredClone` with `ArrayBuffer` transfer or `MessageChannel` support.

#### ECMAScript: Reflect[⬆](#index)
Modules [`es.reflect.apply`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.apply.js), [`es.reflect.construct`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.construct.js), [`es.reflect.define-property`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.define-property.js), [`es.reflect.delete-property`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.delete-property.js), [`es.reflect.get`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.get.js), [`es.reflect.get-own-property-descriptor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.get-own-property-descriptor.js), [`es.reflect.get-prototype-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.get-prototype-of.js), [`es.reflect.has`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.has.js), [`es.reflect.is-extensible`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.is-extensible.js), [`es.reflect.own-keys`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.own-keys.js), [`es.reflect.prevent-extensions`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.prevent-extensions.js), [`es.reflect.set`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.set.js), [`es.reflect.set-prototype-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.set-prototype-of.js), [`es.reflect.to-string-tag`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.to-string-tag.js).
```ts
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
  setPrototypeOf(target: Object, proto: Object | null): boolean;
  @@toStringTag: 'Reflect';
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
core-js(-pure)/es|stable|actual|full/reflect/to-string-tag
```
[*Examples*](https://core-js.io/playground#code=let+object+%3D+%7B+a%3A+1+%7D%3B%0AObject.defineProperty%28object%2C+%27b%27%2C+%7B+value%3A+2+%7D%29%3B%0Aobject%5BSymbol%28%27c%27%29%5D+%3D+3%3B%0AReflect.ownKeys%28object%29%3B+%2F%2F+%3D%3E+%5B%27a%27%2C+%27b%27%2C+Symbol%28c%29%5D%0A%0Afunction+C%28a%2C+b%29+%7B%0A++this.c+%3D+a+%2B+b%3B%0A%7D%0A%0Alet+instance+%3D+Reflect.construct%28C%2C+%5B20%2C+22%5D%29%3B%0Ainstance.c%3B+%2F%2F+%3D%3E+42):
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
Since the `JSON` object is missing only in very old engines like IE7-, `core-js` does not provide a full `JSON.stringify` polyfill; however, it fixes existing implementations according to the current standard. `JSON.parse` is fully polyfilled.

Modules [`es.json.is-raw-json`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.json.is-raw-json.js), [`es.json.parse`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.json.parse.js), [`es.json.raw-json`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.json.raw-json.js), [`es.json.stringify`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.json.stringify.js) and [`es.json.to-string-tag`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.json.to-string-tag.js).
```ts
namespace JSON {
  isRawJSON(O: any): boolean;
  parse(text: string, reviver?: (this: any, key: string, value: any, context: { source?: string }) => any): any;
  rawJSON(text: any): RawJSON;
  stringify(value: any, replacer?: Array<string | number> | (this: any, key: string, value: any) => any, space?: string | number): string | void;
  @@toStringTag: 'JSON';
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/json
core-js(-pure)/es|stable|actual|full/json/is-raw-json
core-js(-pure)/es|stable|actual|full/json/parse
core-js(-pure)/es|stable|actual|full/json/raw-json
core-js(-pure)/es|stable|actual|full/json/stringify
```
[*Examples*](https://core-js.io/playground#code=JSON.stringify%28%7B+%27%F0%A0%AE%B7%27%3A+%5B%27%5CuDF06%5CuD834%27%5D+%7D%29%3B+%2F%2F+%3D%3E+%27%7B%22%F0%A0%AE%B7%22%3A%5B%22%5C%5Cudf06%5C%5Cud834%22%5D%7D%27%0A%0Afunction+digitsToBigInt%28key%2C+val%2C+%7B+source+%7D%29+%7B%0A++return+%2F%5E%5Cd%2B%24%2F.test%28source%29+%3F+BigInt%28source%29+%3A+val%3B%0A%7D%0A%0Afunction+bigIntToRawJSON%28key%2C+val%29+%7B%0A++return+typeof+val+%3D%3D%3D+%27bigint%27+%3F+JSON.rawJSON%28String%28val%29%29+%3A+val%3B%0A%7D%0A%0Aconst+tooBigForNumber+%3D+BigInt%28Number.MAX_SAFE_INTEGER%29+%2B+2n%3B%0AJSON.parse%28String%28tooBigForNumber%29%2C+digitsToBigInt%29+%3D%3D%3D+tooBigForNumber%3B+%2F%2F+%3D%3E+true%0A%0Aconst+wayTooBig+%3D+BigInt%28%601%24%7B+%270%27.repeat%281000%29+%7D%60%29%3B%0AJSON.parse%28String%28wayTooBig%29%2C+digitsToBigInt%29+%3D%3D%3D+wayTooBig%3B+%2F%2F+%3D%3E+true%0A%0Aconst+embedded+%3D+JSON.stringify%28%7B+tooBigForNumber+%7D%2C+bigIntToRawJSON%29%3B%0Aembedded+%3D%3D%3D+%27%7B%22tooBigForNumber%22%3A9007199254740993%7D%27%3B+%2F%2F+%3D%3E+true):
```js
JSON.stringify({ '𠮷': ['\uDF06\uD834'] }); // => '{"𠮷":["\\udf06\\ud834"]}'

function digitsToBigInt(key, val, { source }) {
  return /^\d+$/.test(source) ? BigInt(source) : val;
}

function bigIntToRawJSON(key, val) {
  return typeof val === 'bigint' ? JSON.rawJSON(String(val)) : val;
}

const tooBigForNumber = BigInt(Number.MAX_SAFE_INTEGER) + 2n;
JSON.parse(String(tooBigForNumber), digitsToBigInt) === tooBigForNumber; // => true

const wayTooBig = BigInt(`1${ '0'.repeat(1000) }`);
JSON.parse(String(wayTooBig), digitsToBigInt) === wayTooBig; // => true

const embedded = JSON.stringify({ tooBigForNumber }, bigIntToRawJSON);
embedded === '{"tooBigForNumber":9007199254740993}'; // => true
```

#### ECMAScript: globalThis[⬆](#index)
Modules [`es.global-this`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.global-this.js).
```ts
let globalThis: GlobalThisValue;
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/global-this
```
[*Examples*](https://core-js.io/playground#code=globalThis.Array+%3D%3D%3D+Array%3B+%2F%2F+%3D%3E+true):
```js
globalThis.Array === Array; // => true
```

### ECMAScript proposals[⬆](#index)
[The TC39 process.](https://tc39.es/process-document/)

`core-js/stage/3` entry point contains stage 3 and all higher-stage proposals (including finished ones and obsolete versions kept for compatibility), `core-js/stage/2.7` - stage 2.7 and higher, etc.

#### Finished proposals[⬆](#index)

Finished (stage 4) proposals are already marked in `core-js` as stable ECMAScript and available in the `core-js/stable` and `core-js/es` namespaces; you can find them in the related sections of the README. However, even for finished proposals, `core-js` provides a way to include only features for a specific proposal like `core-js/proposals/proposal-name`.

##### [`globalThis`](https://github.com/tc39/proposal-global)[⬆](#index)
```ts
let globalThis: GlobalThisValue;
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/global-this
```
##### [Relative indexing method](https://github.com/tc39/proposal-relative-indexing-method)[⬆](#index)
```ts
class Array {
  at(index: int): any;
}

class String {
  at(index: int): string | void;
}

class %TypedArray% {
  at(index: int): number | void;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/relative-indexing-method
```
##### [`Array.prototype.includes`](https://github.com/tc39/proposal-Array.prototype.includes)[⬆](#index)
```ts
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
```ts
class Array {
  flat(depthArg?: number = 1): Array<mixed>;
  flatMap(mapFn: (value: any, index: number, target: any) => any, thisArg?: any): Array<mixed>;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/array-flat-map
```
##### [Array find from last](https://github.com/tc39/proposal-array-find-from-last)[⬆](#index)
```ts
class Array {
  findLast(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): any;
  findLastIndex(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): number;
}

class %TypedArray% {
  findLast(callbackfn: (value: any, index: number, target: %TypedArray%) => boolean, thisArg?: any): any;
  findLastIndex(callbackfn: (value: any, index: number, target: %TypedArray%) => boolean, thisArg?: any): number;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/array-find-from-last
```
##### [Change `Array` by copy](https://github.com/tc39/proposal-change-array-by-copy)[⬆](#index)
```ts
class Array {
  toReversed(): Array<mixed>;
  toSpliced(start?: number, deleteCount?: number, ...items: Array<mixed>): Array<mixed>;
  toSorted(comparefn?: (a: any, b: any) => number): Array<mixed>;
  with(index: int, value: any): Array<mixed>;
}

class %TypedArray% {
  toReversed(): %TypedArray%;
  toSorted(comparefn?: (a: any, b: any) => number): %TypedArray%;
  with(index: int, value: any): %TypedArray%;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/change-array-by-copy
core-js(-pure)/es|stable|actual|full/array(/prototype)/to-reversed
core-js(-pure)/es|stable|actual|full/array(/prototype)/to-sorted
core-js(-pure)/es|stable|actual|full/array(/prototype)/to-spliced
core-js(-pure)/es|stable|actual|full/array(/prototype)/with
core-js/es|stable|actual|full/typed-array/to-reversed
core-js/es|stable|actual|full/typed-array/to-sorted
core-js/es|stable|actual|full/typed-array/with
```
##### [`Array` grouping](https://github.com/tc39/proposal-array-grouping)[⬆](#index)
```ts
class Object {
  static groupBy(items: Iterable, callbackfn: (value: any, index: number) => key): { [key]: Array<mixed> };
}

class Map {
  static groupBy(items: Iterable, callbackfn: (value: any, index: number) => key): Map<key, Array<mixed>>;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/array-grouping-v2
```

##### [`Array.fromAsync`](https://github.com/tc39/proposal-array-from-async)[⬆](#index)
```ts
class Array {
  static fromAsync(asyncItems: AsyncIterable | Iterable | ArrayLike, mapFn?: (value: any, index: number) => any, thisArg?: any): Promise<Array<mixed>>;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/array-from-async
```

##### [`ArrayBuffer.prototype.transfer` and friends](https://github.com/tc39/proposal-arraybuffer-transfer)[⬆](#index)
```ts
class ArrayBuffer {
  readonly attribute detached: boolean;
  transfer(newLength?: number): ArrayBuffer;
  transferToFixedLength(newLength?: number): ArrayBuffer;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/array-buffer-transfer
```

##### [`Uint8Array` to / from base64 and hex](https://github.com/tc39/proposal-arraybuffer-base64)[⬆](#index)
```ts
class Uint8Array {
  static fromBase64(string: string, options?: { alphabet?: 'base64' | 'base64url', lastChunkHandling?: 'loose' | 'strict' | 'stop-before-partial' }): Uint8Array;
  static fromHex(string: string): Uint8Array;
  setFromBase64(string: string, options?: { alphabet?: 'base64' | 'base64url', lastChunkHandling?: 'loose' | 'strict' | 'stop-before-partial' }): { read: uint, written: uint };
  setFromHex(string: string): { read: uint, written: uint };
  toBase64(options?: { alphabet?: 'base64' | 'base64url', omitPadding?: boolean }): string;
  toHex(): string;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/array-buffer-base64
```

##### [`Error` cause](https://github.com/tc39/proposal-error-cause)[⬆](#index)
```ts
class Error {
  constructor(message?: string, { cause: any }?): %Error%;
}

class [
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError,
  WebAssembly.CompileError,
  WebAssembly.LinkError,
  WebAssembly.RuntimeError,
] extends Error {
  constructor(message?: string, { cause: any }?): %Error%;
}

class AggregateError extends Error {
  constructor(errors: Iterable, message?: string, { cause: any }?): AggregateError;
  cause: any;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/error-cause
core-js/es|stable|actual|full/error
core-js/es|stable|actual|full/error/constructor
core-js(-pure)/es|stable|actual|full/aggregate-error
```

##### [`Error.isError`](https://github.com/tc39/proposal-is-error)[⬆](#index)
```ts
class Error {
  static isError(value: any): boolean;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/is-error
```

> [!WARNING]
> We have no bulletproof way to polyfill this `Error.isError` / check if the object is an error, so it's a rather naive implementation.


##### [Explicit resource management](https://github.com/tc39/proposal-explicit-resource-management)[⬆](#index)
> [!NOTE]
> These are only built-ins for Explicit Resource Management; the `using` syntax requires [transpiler support](https://babeljs.io/docs/babel-plugin-transform-explicit-resource-management).

> [!WARNING]
> By default, `core-js` has no access to the real `%AsyncIteratorPrototype%`, so in engines without native support, async generator objects do not get `@@asyncDispose`. To fix it, set the `USE_FUNCTION_CONSTRUCTOR` option of `core-js/configurator` to `true` or pass `%AsyncIteratorPrototype%` to it as the `AsyncIteratorPrototype` option, see [`AsyncIterator` helpers caveats](#caveats).
```ts
class Symbol {
  static asyncDispose: @@asyncDispose;
  static dispose: @@dispose;
}

class DisposableStack {
  constructor(): DisposableStack;
  readonly attribute disposed: boolean;
  dispose(): undefined;
  use(value: Disposable | null | undefined): value;
  adopt(value: any, onDispose: Function): value;
  defer(onDispose: Function): undefined;
  move(): DisposableStack;
  @@dispose(): undefined;
  @@toStringTag: 'DisposableStack';
}

class AsyncDisposableStack {
  constructor(): AsyncDisposableStack;
  readonly attribute disposed: boolean;
  disposeAsync(): Promise<undefined>;
  use(value: AsyncDisposable | Disposable | null | undefined): value;
  adopt(value: any, onDispose: Function): value;
  defer(onDispose: Function): undefined;
  move(): AsyncDisposableStack;
  @@asyncDispose(): Promise<undefined>;
  @@toStringTag: 'AsyncDisposableStack';
}

class SuppressedError extends Error {
  constructor(error: any, suppressed: any, message?: string): SuppressedError;
  error: any;
  suppressed: any;
  message: string;
}

class Iterator {
  @@dispose(): undefined;
}

class AsyncIterator {
  @@asyncDispose(): Promise<undefined>;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/explicit-resource-management
```

##### [`Float16` methods](https://github.com/tc39/proposal-float16array)[⬆](#index)
```ts
class DataView {
  getFloat16(offset: any, littleEndian?: boolean = false): float16;
  setFloat16(offset: any, value: any, littleEndian?: boolean = false): void;
}

namespace Math {
  f16round(number: any): number;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/float16
```

##### [`Iterator` helpers](https://github.com/tc39/proposal-iterator-helpers)[⬆](#index)
```ts
class Iterator {
  static from(iterable: Iterable<any> | Iterator<any>): Iterator<any>;
  drop(limit: uint): Iterator<any>;
  every(callbackfn: (value: any, counter: uint) => boolean): boolean;
  filter(callbackfn: (value: any, counter: uint) => boolean): Iterator<any>;
  find(callbackfn: (value: any, counter: uint) => boolean): any;
  flatMap(callbackfn: (value: any, counter: uint) => Iterable<any> | Iterator<any>): Iterator<any>;
  forEach(callbackfn: (value: any, counter: uint) => void): void;
  map(callbackfn: (value: any, counter: uint) => any): Iterator<any>;
  reduce(callbackfn: (memo: any, value: any, counter: uint) => any, initialValue?: any): any;
  some(callbackfn: (value: any, counter: uint) => boolean): boolean;
  take(limit: uint): Iterator<any>;
  toArray(): Array<any>;
  @@toStringTag: 'Iterator';
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/iterator-helpers
```

##### [`Iterator` sequencing](https://github.com/tc39/proposal-iterator-sequencing)[⬆](#index)
```ts
class Iterator {
  static concat(...items: Array<IterableObject>): Iterator<any>;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/iterator-sequencing
```

##### [`Iterator` chunking](https://github.com/tc39/proposal-iterator-chunking)[⬆](#index)
Modules [`es.iterator.chunks`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.chunks.js)
and [`es.iterator.windows`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.windows.js).
```ts
class Iterator {
  chunks(chunkSize: number): Iterator<any>;
  windows(windowSize: number, undersized?: 'only-full' | 'allow-partial' | undefined): Iterator<any>;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/iterator-chunking-v2
core-js(-pure)/es|stable|actual|full/iterator/chunks
core-js(-pure)/es|stable|actual|full/iterator/windows
```
[*Examples*](https://core-js.io/playground#code=const+digits+%3D+%28%29+%3D%3E+%5B0%2C+1%2C+2%2C+3%2C+4%2C+5%2C+6%2C+7%2C+8%2C+9%5D.values%28%29%3B%0A%0Alet+chunks+%3D+Array.from%28digits%28%29.chunks%282%29%29%3B++%2F%2F+%3D%3E+%5B%5B0%2C+1%5D%2C+%5B2%2C+3%5D%2C+%5B4%2C+5%5D%2C+%5B6%2C+7%5D%2C+%5B8%2C+9%5D%5D%0A%0Alet+windows+%3D+Array.from%28digits%28%29.windows%282%29%29%3B++%2F%2F+%3D%3E+%5B%5B0%2C+1%5D%2C+%5B1%2C+2%5D%2C+%5B2%2C+3%5D%2C+%5B3%2C+4%5D%2C+%5B4%2C+5%5D%2C+%5B5%2C+6%5D%2C+%5B6%2C+7%5D%2C+%5B7%2C+8%5D%2C+%5B8%2C+9%5D%5D%0A%0Alet+windowsPartial+%3D+Array.from%28%5B0%2C+1%5D.values%28%29.windows%283%2C+%27allow-partial%27%29%29%3B++%2F%2F+%3D%3E+%5B%5B0%2C+1%5D%5D%0A%0Alet+windowsFull+%3D+Array.from%28%5B0%2C+1%5D.values%28%29.windows%283%29%29%3B++%2F%2F+%3D%3E+%5B%5D):
```js
const digits = () => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].values();

let chunks = Array.from(digits().chunks(2));  // => [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9]]

let windows = Array.from(digits().windows(2));  // => [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9]]

let windowsPartial = Array.from([0, 1].values().windows(3, 'allow-partial'));  // => [[0, 1]]

let windowsFull = Array.from([0, 1].values().windows(3));  // => []
```

##### [`Iterator` includes](https://github.com/tc39/proposal-iterator-includes)[⬆](#index)
Modules [`es.iterator.includes`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.includes.js).
```ts
class Iterator {
  includes(searchElement: any, skippedElements?: number): boolean;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/iterator-includes
core-js(-pure)/es|stable|actual|full/iterator/includes
```
[*Examples*](https://core-js.io/playground#code=%5B1%2C+2%2C+3%5D.values%28%29.includes%282%29%3B+++++%2F%2F+%3D%3E+true%0A%5B1%2C+2%2C+3%5D.values%28%29.includes%284%29%3B+++++%2F%2F+%3D%3E+false%0A%5BNaN%5D.values%28%29.includes%28NaN%29%3B+++++++%2F%2F+%3D%3E+true%0A%5B1%2C+2%2C+3%5D.values%28%29.includes%283%2C+2%29%3B++%2F%2F+%3D%3E+true%0A%5B1%2C+2%2C+3%5D.values%28%29.includes%281%2C+1%29%3B++%2F%2F+%3D%3E+false):
```js
[1, 2, 3].values().includes(2);     // => true
[1, 2, 3].values().includes(4);     // => false
[NaN].values().includes(NaN);       // => true
[1, 2, 3].values().includes(3, 2);  // => true
[1, 2, 3].values().includes(1, 1);  // => false
```

##### [`Iterator` join](https://github.com/tc39/proposal-iterator-join)[⬆](#index)
Modules [`es.iterator.join`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.join.js).
```ts
class Iterator {
  join(separator?: string): string;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/iterator-join
core-js(-pure)/es|stable|actual|full/iterator/join
```
[*Examples*](https://core-js.io/playground#code=%2F%2A+eslint-disable+unicorn%2Frequire-array-join-separator+--+example+%2A%2F%0A%5B1%2C+2%2C+3%5D.values%28%29.join%28%29%3B+++++%2F%2F+%3D%3E+%271%2C2%2C3%27%0A%5B1%2C+2%2C+3%5D.values%28%29.join%28%27-%27%29%3B++%2F%2F+%3D%3E+%271-2-3%27%0A%5B1%2C+null%2C+3%5D.values%28%29.join%28%29%3B++%2F%2F+%3D%3E+%271%2C%2C3%27%0A%2F%2A+eslint-enable+unicorn%2Frequire-array-join-separator+--+example+%2A%2F):
```js
/* eslint-disable unicorn/require-array-join-separator -- example */
[1, 2, 3].values().join();     // => '1,2,3'
[1, 2, 3].values().join('-');  // => '1-2-3'
[1, null, 3].values().join();  // => '1,,3'
/* eslint-enable unicorn/require-array-join-separator -- example */
```

##### [Joint iteration](https://github.com/tc39/proposal-joint-iteration)[⬆](#index)
Modules [`es.iterator.zip`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.zip.js), [`es.iterator.zip-keyed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.zip-keyed.js).
```ts
class Iterator {
  static zip<T extends readonly Iterable<unknown>[]>(
    iterables: T,
    options?: {
      mode?: 'shortest' | 'longest' | 'strict';
      padding?: { [K in keyof T]?: T[K] extends Iterable<infer U> ? U : never };
    }
  ): Iterator<{ [K in keyof T]: T[K] extends Iterable<infer U> ? U : never }>;
  static zipKeyed<K extends PropertyKey, V extends Record<K, Iterable<unknown>>>(
    iterables: V,
    options?: {
      mode?: 'shortest' | 'longest' | 'strict';
      padding?: { [P in keyof V]?: V[P] extends Iterable<infer U> ? U : never };
    }
  ): Iterator<{ [P in keyof V]: V[P] extends Iterable<infer U> ? U : never }>;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/joint-iteration
core-js(-pure)/es|stable|actual|full/iterator/zip
core-js(-pure)/es|stable|actual|full/iterator/zip-keyed
```
[*Examples*](https://core-js.io/playground#code=Iterator.zip%28%5B%0A++%5B0%2C+1%2C+2%5D%2C%0A++%5B3%2C+4%2C+5%5D%2C%0A%5D%29.toArray%28%29%3B++%2F%2F+%3D%3E+%5B%5B0%2C+3%5D%2C+%5B1%2C+4%5D%2C+%5B2%2C+5%5D%5D%0A%0AIterator.zipKeyed%28%7B%0A++a%3A+%5B0%2C+1%2C+2%5D%2C%0A++b%3A+%5B3%2C+4%2C+5%2C+6%5D%2C%0A++c%3A+%5B7%2C+8%2C+9%5D%2C%0A%7D%2C+%7B%0A++mode%3A+%27longest%27%2C%0A++padding%3A+%7B+c%3A+10+%7D%2C%0A%7D%29.toArray%28%29%3B+%2F%2F+%3D%3E%0A%2F%2A%0A%5B%0A++%7B+a%3A+0%2C+++++++++b%3A+3%2C+c%3A+7++%7D%2C%0A++%7B+a%3A+1%2C+++++++++b%3A+4%2C+c%3A+8++%7D%2C%0A++%7B+a%3A+2%2C+++++++++b%3A+5%2C+c%3A+9++%7D%2C%0A++%7B+a%3A+undefined%2C+b%3A+6%2C+c%3A+10+%7D%2C%0A%5D%3B%0A+%2A%2F):
```js
Iterator.zip([
  [0, 1, 2],
  [3, 4, 5],
]).toArray();  // => [[0, 3], [1, 4], [2, 5]]

Iterator.zipKeyed({
  a: [0, 1, 2],
  b: [3, 4, 5, 6],
  c: [7, 8, 9],
}, {
  mode: 'longest',
  padding: { c: 10 },
}).toArray(); // =>
/*
[
  { a: 0,         b: 3, c: 7  },
  { a: 1,         b: 4, c: 8  },
  { a: 2,         b: 5, c: 9  },
  { a: undefined, b: 6, c: 10 },
];
 */
```

##### [`Object.values` / `Object.entries`](https://github.com/tc39/proposal-object-values-entries)[⬆](#index)
```ts
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
```ts
class Object {
  static fromEntries(iterable: Iterable<[key, value]>): Object;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/object-from-entries
```
##### [`Object.getOwnPropertyDescriptors`](https://github.com/tc39/proposal-object-getownpropertydescriptors)[⬆](#index)
```ts
class Object {
  static getOwnPropertyDescriptors(object: any): { [property: PropertyKey]: PropertyDescriptor };
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/object-getownpropertydescriptors
```
##### [Accessible `Object.prototype.hasOwnProperty`](https://github.com/tc39/proposal-accessible-object-hasownproperty)[⬆](#index)
```ts
class Object {
  static hasOwn(object: object, key: PropertyKey): boolean;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/accessible-object-hasownproperty
```
##### [`String` padding](https://github.com/tc39/proposal-string-pad-start-end)[⬆](#index)
```ts
class String {
  padStart(length: number, fillStr?: string = ' '): string;
  padEnd(length: number, fillStr?: string = ' '): string;
}

```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/string-padding
```
##### [`String.prototype.matchAll`](https://github.com/tc39/proposal-string-matchall)[⬆](#index)
```ts
class String {
  matchAll(regexp: RegExp): Iterator;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/string-match-all
```
##### [`String.prototype.replaceAll`](https://github.com/tc39/proposal-string-replaceall)[⬆](#index)
```ts
class String {
  replaceAll(searchValue: string | RegExp, replaceString: string | (searchValue, index, this) => string): string;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/string-replace-all
```
##### [`String.prototype.trimStart` / `String.prototype.trimEnd`](https://github.com/tc39/proposal-string-left-right-trim)[⬆](#index)
```ts
class String {
  trimLeft(): string;
  trimRight(): string;
  trimStart(): string;
  trimEnd(): string;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/string-left-right-trim
```
##### [`RegExp` `s` (`dotAll`) flag](https://github.com/tc39/proposal-regexp-dotall-flag)[⬆](#index)
```ts
// patched to support the `RegExp` dotAll (`s`) flag:
class RegExp {
  constructor(pattern: RegExp | string, flags?: string): RegExp;
  exec(string: string): Array<string | undefined> | null;
  readonly attribute dotAll: boolean;
  readonly attribute flags: string;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/regexp-dotall-flag
```
##### [`RegExp` named capture groups](https://github.com/tc39/proposal-regexp-named-groups)[⬆](#index)
```ts
// patched to support `RegExp` named capture groups:
class RegExp {
  constructor(pattern: RegExp | string, flags?: string): RegExp;
  exec(string: string): Array<string | undefined> | null;
  @@replace(string: string, replaceValue: Function | string): string;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/regexp-named-groups
```

##### [`RegExp` escaping](https://github.com/tc39/proposal-regex-escaping)[⬆](#index)
```ts
class RegExp {
  static escape(value: string): string;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/regexp-escaping
```

##### [`Promise.allSettled`](https://github.com/tc39/proposal-promise-allSettled)[⬆](#index)
```ts
class Promise {
  static allSettled(iterable: Iterable): Promise;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/promise-all-settled
```
##### [`Promise.any`](https://github.com/tc39/proposal-promise-any)[⬆](#index)
```ts
class AggregateError {
  constructor(errors: Iterable, message?: string): AggregateError;
  errors: Array<any>;
  message: string;
}

class Promise {
  static any(promises: Iterable): Promise<any>;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/promise-any
```
##### [`Promise.prototype.finally`](https://github.com/tc39/proposal-promise-finally)[⬆](#index)
```ts
class Promise {
  finally(onFinally: Function): Promise;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/promise-finally
```

##### [`Promise.try`](https://github.com/tc39/proposal-promise-try)[⬆](#index)
```ts
class Promise {
  static try(callbackfn: Function, ...args: Array<mixed>): Promise;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/promise-try
```

##### [`Promise.withResolvers`](https://github.com/tc39/proposal-promise-with-resolvers)[⬆](#index)
```ts
class Promise {
  static withResolvers(): { promise: Promise, resolve: Function, reject: Function };
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/promise-with-resolvers
```
##### [`Symbol.asyncIterator` for asynchronous iteration](https://github.com/tc39/proposal-async-iteration)[⬆](#index)
```ts
class Symbol {
  static asyncIterator: @@asyncIterator;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/async-iteration
```
##### [`Symbol.prototype.description`](https://github.com/tc39/proposal-Symbol-description)[⬆](#index)
```ts
class Symbol {
  readonly attribute description: string | void;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/symbol-description
```

##### [`JSON.parse` source text access](https://github.com/tc39/proposal-json-parse-with-source)[⬆](#index)
```ts
namespace JSON {
  isRawJSON(O: any): boolean;
  // patched for source support
  parse(text: string, reviver?: (this: any, key: string, value: any, context: { source?: string }) => any): any;
  rawJSON(text: any): RawJSON;
  // patched for `JSON.rawJSON` support
  stringify(value: any, replacer?: Array<string | number> | (this: any, key: string, value: any) => any, space?: string | number): string | void;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/json-parse-with-source
```

##### [Well-formed `JSON.stringify`](https://github.com/tc39/proposal-well-formed-stringify)[⬆](#index)
```ts
namespace JSON {
  stringify(target: any, replacer?: Function | Array, space?: string | number): string | void;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/well-formed-stringify
```
##### [Well-formed Unicode strings](https://github.com/tc39/proposal-is-usv-string)[⬆](#index)
```ts
class String {
  isWellFormed(): boolean;
  toWellFormed(): string;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/well-formed-unicode-strings
```
##### [New `Set` methods](https://github.com/tc39/proposal-set-methods)[⬆](#index)
```ts
class Set {
  difference(other: SetLike<mixed>): Set;
  intersection(other: SetLike<mixed>): Set;
  isDisjointFrom(other: SetLike<mixed>): boolean;
  isSubsetOf(other: SetLike<mixed>): boolean;
  isSupersetOf(other: SetLike<mixed>): boolean;
  symmetricDifference(other: SetLike<mixed>): Set;
  union(other: SetLike<mixed>): Set;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/set-methods
```

##### [`Map` upsert](https://github.com/tc39/proposal-upsert)[⬆](#index)
```ts
class Map {
  getOrInsert(key: any, value: any): any;
  getOrInsertComputed(key: any, callbackfn: (key: any) => any): any;
}

class WeakMap {
  getOrInsert(key: object | symbol, value: any): any;
  getOrInsertComputed(key: object | symbol, callbackfn: (key: any) => any): any;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/map-upsert-v4
```

##### [`Math.sumPrecise`](https://github.com/tc39/proposal-math-sum)[⬆](#index)
```ts
namespace Math {
  sumPrecise(items: Iterable<number>): number;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/math-sum
```

#### Stage 3 proposals[⬆](#index)

[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/stage/3
```

##### [Await dictionary](https://github.com/tc39/proposal-await-dictionary)[⬆](#index)
Modules [`esnext.promise.all-keyed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.promise.all-keyed.js)
and [`esnext.promise.all-settled-keyed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.promise.all-settled-keyed.js).
```ts
class Promise {
  static allKeyed(obj: Record<string | symbol, any>): Promise<Record<string | symbol, any>>;
  static allSettledKeyed(obj: Record<string | symbol, any>): Promise<Record<string | symbol, { status: 'fulfilled', value: any } | { status: 'rejected', reason: any }>>;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/await-dictionary
core-js(-pure)/actual|full/promise/all-keyed
core-js(-pure)/actual|full/promise/all-settled-keyed
```
[*Examples*](https://core-js.io/playground#code=await+Promise.allKeyed%28%7B%0A++a%3A+Promise.resolve%281%29%2C%0A++b%3A+Promise.resolve%282%29%2C%0A++c%3A+3%2C%0A%7D%29%3B+%2F%2F+%3D%3E+%7B+a%3A+1%2C+b%3A+2%2C+c%3A+3+%7D%0A%0Aawait+Promise.allSettledKeyed%28%7B%0A++a%3A+Promise.resolve%281%29%2C%0A++b%3A+Promise.reject%282%29%2C%0A++c%3A+3%2C%0A%7D%29%3B+%2F%2F+%3D%3E+%7B+a%3A+%7B+status%3A+%22fulfilled%22%2C+value%3A+1+%7D%2C+b%3A+%7B+status%3A+%22rejected%22%2C+reason%3A+2+%7D%2C+c%3A+%7B+status%3A+%22fulfilled%22%2C+value%3A+3+%7D+%7D):
```js
await Promise.allKeyed({
  a: Promise.resolve(1),
  b: Promise.resolve(2),
  c: 3,
}); // => { a: 1, b: 2, c: 3 }

await Promise.allSettledKeyed({
  a: Promise.resolve(1),
  b: Promise.reject(2),
  c: 3,
}); // => { a: { status: "fulfilled", value: 1 }, b: { status: "rejected", reason: 2 }, c: { status: "fulfilled", value: 3 } }
```

#### Stage 2.7 proposals[⬆](#index)
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/stage/2.7
```

##### [`Symbol.metadata` for the decorator metadata proposal](https://github.com/tc39/proposal-decorator-metadata)[⬆](#index)
Modules [`esnext.symbol.metadata`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.metadata.js) and [`esnext.function.metadata`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.function.metadata.js).
```ts
class Symbol {
  static metadata: @@metadata;
}

class Function {
  @@metadata: null;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/decorator-metadata
core-js(-pure)/full/symbol/metadata
```

#### Stage 2 proposals[⬆](#index)
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/stage/2
```
##### [`AsyncIterator` helpers](https://github.com/tc39/proposal-async-iterator-helpers)[⬆](#index)
Modules [`esnext.async-iterator.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.constructor.js), [`esnext.async-iterator.drop`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.drop.js), [`esnext.async-iterator.every`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.every.js), [`esnext.async-iterator.filter`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.filter.js), [`esnext.async-iterator.find`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.find.js), [`esnext.async-iterator.flat-map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.flat-map.js), [`esnext.async-iterator.for-each`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.for-each.js), [`esnext.async-iterator.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.from.js), [`esnext.async-iterator.map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.map.js), [`esnext.async-iterator.reduce`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.reduce.js), [`esnext.async-iterator.some`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.some.js), [`esnext.async-iterator.take`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.take.js), [`esnext.async-iterator.to-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.to-array.js), [`esnext.iterator.to-async`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.to-async.js).
```ts
class Iterator {
  toAsync(): AsyncIterator<any>;
}

class AsyncIterator {
  static from(iterable: AsyncIterable<any> | Iterable<any> | AsyncIterator<any>): AsyncIterator<any>;
  drop(limit: uint): AsyncIterator<any>;
  every(async callbackfn: (value: any, counter: uint) => boolean): Promise<boolean>;
  filter(async callbackfn: (value: any, counter: uint) => boolean): AsyncIterator<any>;
  find(async callbackfn: (value: any, counter: uint) => boolean): Promise<any>;
  flatMap(async callbackfn: (value: any, counter: uint) => AsyncIterable<any> | Iterable<any> | AsyncIterator<any>): AsyncIterator<any>;
  forEach(async callbackfn: (value: any, counter: uint) => void): Promise<void>;
  map(async callbackfn: (value: any, counter: uint) => any): AsyncIterator<any>;
  reduce(async callbackfn: (memo: any, value: any, counter: uint) => any, initialValue?: any): Promise<any>;
  some(async callbackfn: (value: any, counter: uint) => boolean): Promise<boolean>;
  take(limit: uint): AsyncIterator<any>;
  toArray(): Promise<Array>;
  @@toStringTag: 'AsyncIterator';
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/async-iterator-helpers
core-js(-pure)/actual|full/async-iterator
core-js(-pure)/actual|full/async-iterator/drop
core-js(-pure)/actual|full/async-iterator/every
core-js(-pure)/actual|full/async-iterator/filter
core-js(-pure)/actual|full/async-iterator/find
core-js(-pure)/actual|full/async-iterator/flat-map
core-js(-pure)/actual|full/async-iterator/for-each
core-js(-pure)/actual|full/async-iterator/from
core-js(-pure)/actual|full/async-iterator/map
core-js(-pure)/actual|full/async-iterator/reduce
core-js(-pure)/actual|full/async-iterator/some
core-js(-pure)/actual|full/async-iterator/take
core-js(-pure)/actual|full/async-iterator/to-array
core-js(-pure)/actual|full/iterator/to-async
```
[*Examples*](https://core-js.io/playground#code=await+AsyncIterator.from%28%5B1%2C+2%2C+3%2C+4%2C+5%2C+6%2C+7%5D%29%0A++.drop%281%29%0A++.take%285%29%0A++.filter%28it+%3D%3E+it+%25+2%29%0A++.map%28it+%3D%3E+it+%2A%2A+2%29%0A++.toArray%28%29%3B+%2F%2F+%3D%3E+%5B9%2C+25%5D%0A%0Aawait+%5B1%2C+2%2C+3%5D.values%28%29.toAsync%28%29.map%28async+it+%3D%3E+it+%2A%2A+2%29.toArray%28%29%3B+%2F%2F+%3D%3E+%5B1%2C+4%2C+9%5D):
```js
await AsyncIterator.from([1, 2, 3, 4, 5, 6, 7])
  .drop(1)
  .take(5)
  .filter(it => it % 2)
  .map(it => it ** 2)
  .toArray(); // => [9, 25]

await [1, 2, 3].values().toAsync().map(async it => it ** 2).toArray(); // => [1, 4, 9]
```

###### Caveats:[⬆](#index)
- To prevent prototype pollution, in the `pure` version, new `%AsyncIteratorPrototype%` methods are not added to the real `%AsyncIteratorPrototype%`, they are available only on wrappers - instead of `[].values().toAsync().map(fn)` use `AsyncIterator.from([]).map(fn)`.
- Now, we have access to the real `%AsyncIteratorPrototype%` only by using the async generators syntax. So, for compatibility of the library with old browsers, we should use the `Function` constructor. However, that breaks compatibility with CSP. So, if you want to use the real `%AsyncIteratorPrototype%`, you should set `USE_FUNCTION_CONSTRUCTOR` option in the `core-js/configurator` to `true`:
```js
const configurator = require('core-js/configurator');

configurator({ USE_FUNCTION_CONSTRUCTOR: true });

require('core-js/actual/async-iterator');

(async function * () { /* empty */ })() instanceof AsyncIterator; // => true
```
- As an alternative, you could pass to the `core-js/configurator` an object that will be considered as `%AsyncIteratorPrototype%`:
```js
const configurator = require('core-js/configurator');

const { getPrototypeOf } = Object;

configurator({ AsyncIteratorPrototype: getPrototypeOf(getPrototypeOf(getPrototypeOf(async function * () { /* empty */ }()))) });

require('core-js/actual/async-iterator');

(async function * () { /* empty */ })() instanceof AsyncIterator; // => true
```

##### [`Iterator.range`](https://github.com/tc39/proposal-iterator.range)[⬆](#index)
Modules [`esnext.iterator.range`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.range.js).
```ts
class Iterator {
  static range(start: number, end: number, options: { step: number = 1, inclusive: boolean = false } | step: number = 1): NumericRangeIterator;
  static range(start: bigint, end: bigint | Infinity | -Infinity, options: { step: bigint = 1n, inclusive: boolean = false } | step: bigint = 1n): NumericRangeIterator;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/iterator-range
core-js(-pure)/full/iterator/range
```
[*Examples*](https://core-js.io/playground#code=for+%28const+i+of+Iterator.range%281%2C+10%29%29+%7B%0A++console.log%28i%29%3B+%2F%2F+-%3E+1%2C+2%2C+3%2C+4%2C+5%2C+6%2C+7%2C+8%2C+9%0A%7D%0A%0Afor+%28const+i+of+Iterator.range%281%2C+10%2C+%7B+step%3A+3%2C+inclusive%3A+true+%7D%29%29+%7B%0A++console.log%28i%29%3B+%2F%2F+-%3E+1%2C+4%2C+7%2C+10%0A%7D):
```js
for (const i of Iterator.range(1, 10)) {
  console.log(i); // -> 1, 2, 3, 4, 5, 6, 7, 8, 9
}

for (const i of Iterator.range(1, 10, { step: 3, inclusive: true })) {
  console.log(i); // -> 1, 4, 7, 10
}
```

##### [`Number.prototype.clamp`](https://github.com/tc39/proposal-math-clamp)[⬆](#index)
Modules [`esnext.number.clamp`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.number.clamp.js).
```ts
class Number {
  clamp(min: number, max: number): number;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/math-clamp-v2
core-js(-pure)/full/number(/virtual)/clamp
```
[*Examples*](https://core-js.io/playground#code=5.0.clamp%280%2C+10%29%3B+%2F%2F+%3D%3E+5%0A%28-5%29.clamp%280%2C+10%29%3B+%2F%2F+%3D%3E+0%0A15.0.clamp%280%2C+10%29%3B+%2F%2F+%3D%3E+10):
```js
5.0.clamp(0, 10); // => 5
(-5).clamp(0, 10); // => 0
15.0.clamp(0, 10); // => 10
```

##### [`String.dedent`](https://github.com/tc39/proposal-string-dedent)[⬆](#index)
Modules [`esnext.string.dedent`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.string.dedent.js).
```ts
class String {
  static dedent(templateOrTag: { raw: Array<string> } | function, ...substitutions: Array<string>): string | function;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/string-dedent
core-js(-pure)/full/string/dedent
```
[*Examples*](https://core-js.io/playground#code=const+message+%3D+42%3B%0A%0Aconsole.log%28String.dedent%60%0A++print%28%27%24%7B+message+%7D%27%29%0A%60%29%3B+%2F%2F+-%3E+print%28%2742%27%29%0A%0AString.dedent%28console.log%29%60%0A++print%28%27%24%7B+message+%7D%27%29%0A%60%3B+%2F%2F+-%3E+%5B%22print%28%27%22%2C+%22%27%29%22%2C+raw%3A+Array%282%29%5D%2C+42):
```js
const message = 42;

console.log(String.dedent`
  print('${ message }')
`); // -> print('42')

String.dedent(console.log)`
  print('${ message }')
`; // -> ["print('", "')", raw: Array(2)], 42
```

##### [`Symbol` predicates](https://github.com/tc39/proposal-symbol-predicates)[⬆](#index)
Modules [`esnext.symbol.is-registered-symbol`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.is-registered-symbol.js), [`esnext.symbol.is-well-known-symbol`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.is-well-known-symbol.js).
```ts
class Symbol {
  static isRegisteredSymbol(value: any): boolean;
  static isWellKnownSymbol(value: any): boolean;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/symbol-predicates
core-js(-pure)/full/symbol/is-registered-symbol
core-js(-pure)/full/symbol/is-well-known-symbol
```
[*Examples*](https://core-js.io/playground#code=Symbol.isRegisteredSymbol%28Symbol.for%28%27key%27%29%29%3B+%2F%2F+%3D%3E+true%0ASymbol.isRegisteredSymbol%28Symbol%28%27key%27%29%29%3B+%2F%2F+%3D%3E+false%0A%0ASymbol.isWellKnownSymbol%28Symbol.iterator%29%3B+%2F%2F+%3D%3E+true%0ASymbol.isWellKnownSymbol%28Symbol%28%27key%27%29%29%3B+%2F%2F+%3D%3E+false):
```js
Symbol.isRegisteredSymbol(Symbol.for('key')); // => true
Symbol.isRegisteredSymbol(Symbol('key')); // => false

Symbol.isWellKnownSymbol(Symbol.iterator); // => true
Symbol.isWellKnownSymbol(Symbol('key')); // => false
```

##### [`Symbol.customMatcher` for extractors](https://github.com/tc39/proposal-extractors)[⬆](#index)
Modules [`esnext.symbol.custom-matcher`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.custom-matcher.js).
```ts
class Symbol {
  static customMatcher: @@customMatcher;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/extractors
core-js(-pure)/full/symbol/custom-matcher
```

##### [`Object.keysLength`](https://github.com/tc39/proposal-object-keys-length)[⬆](#index)
Module [`esnext.object.keys-length`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.object.keys-length.js).
```ts
class Object {
  static keysLength(obj: Object): number;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/object-keys-length
core-js(-pure)/full/object/keys-length
```
*Examples*:
```js
Object.keysLength({ a: 1, b: 2 }); // => 2
```

#### Stage 1 proposals[⬆](#index)
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/stage/1
```

##### [`.of` and `.from` methods on collection constructors](https://github.com/tc39/proposal-setmap-offrom)[⬆](#index)
Modules [`esnext.set.of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.of.js), [`esnext.set.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.set.from.js), [`esnext.map.of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.of.js), [`esnext.map.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.map.from.js), [`esnext.weak-set.of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.weak-set.of.js), [`esnext.weak-set.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.weak-set.from.js), [`esnext.weak-map.of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.weak-map.of.js), [`esnext.weak-map.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.weak-map.from.js).
```ts
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
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/collection-of-from
core-js(-pure)/full/set/from
core-js(-pure)/full/set/of
core-js(-pure)/full/map/from
core-js(-pure)/full/map/of
core-js(-pure)/full/weak-set/of
core-js(-pure)/full/weak-set/from
core-js(-pure)/full/weak-map/of
core-js(-pure)/full/weak-map/from
```
`.of` / `.from` [*examples*](https://core-js.io/playground#code=Set.of%281%2C+2%2C+3%2C+2%2C+1%29%3B+%2F%2F+%3D%3E+Set+%7B+1%2C+2%2C+3+%7D%0A%0AMap.from%28%5B%5B1%2C+2%5D%2C+%5B3%2C+4%5D%5D%2C+%28%5Bkey%2C+value%5D%29+%3D%3E+%5Bkey+%2A%2A+2%2C+value+%2A%2A+2%5D%29%3B+%2F%2F+%3D%3E+Map+%7B+1+%3D%3E+4%2C+9+%3D%3E+16+%7D):
```js
Set.of(1, 2, 3, 2, 1); // => Set { 1, 2, 3 }

Map.from([[1, 2], [3, 4]], ([key, value]) => [key ** 2, value ** 2]); // => Map { 1 => 4, 9 => 16 }
```

##### [Array filtering](https://github.com/tc39/proposal-array-filtering)[⬆](#index)
Modules [`esnext.array.filter-reject`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.filter-reject.js) and [`esnext.typed-array.filter-reject`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.typed-array.filter-reject.js).
```ts
class Array {
  filterReject(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): Array<mixed>;
}

class %TypedArray% {
  filterReject(callbackfn: (value: number, index: number, target: %TypedArray%) => boolean, thisArg?: any): %TypedArray%;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/array-filtering
core-js(-pure)/full/array(/prototype)/filter-reject
core-js/full/typed-array/filter-reject
```
[*Examples*](https://core-js.io/playground#code=%5B1%2C+2%2C+3%2C+4%2C+5%5D.filterReject%28it+%3D%3E+it+%25+2%29%3B+%2F%2F+%3D%3E+%5B2%2C+4%5D):
```js
[1, 2, 3, 4, 5].filterReject(it => it % 2); // => [2, 4]
```
##### [Array deduplication](https://github.com/tc39/proposal-array-unique)[⬆](#index)
Modules [`esnext.array.unique-by`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.unique-by.js) and [`esnext.typed-array.unique-by`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.typed-array.unique-by.js).
```ts
class Array {
  uniqueBy(resolver?: (item: any) => any): Array<mixed>;
}

class %TypedArray% {
  uniqueBy(resolver?: (item: any) => any): %TypedArray%;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/array-unique
core-js(-pure)/full/array(/prototype)/unique-by
core-js/full/typed-array/unique-by
```
[*Examples*](https://core-js.io/playground#code=%5B1%2C+2%2C+3%2C+2%2C+1%5D.uniqueBy%28%29%3B+%2F%2F+%3D%3E+%5B1%2C+2%2C+3%5D%0A%0A%5B%0A++%7B+id%3A+1%2C+uid%3A+10000+%7D%2C%0A++%7B+id%3A+2%2C+uid%3A+10000+%7D%2C%0A++%7B+id%3A+3%2C+uid%3A+10001+%7D%2C%0A%5D.uniqueBy%28it+%3D%3E+it.uid%29%3B++++%2F%2F+%3D%3E+%5B%7B+id%3A+1%2C+uid%3A+10000+%7D%2C+%7B+id%3A+3%2C+uid%3A+10001+%7D%5D):
```js
[1, 2, 3, 2, 1].uniqueBy(); // => [1, 2, 3]

[
  { id: 1, uid: 10000 },
  { id: 2, uid: 10000 },
  { id: 3, uid: 10001 },
].uniqueBy(it => it.uid);    // => [{ id: 1, uid: 10000 }, { id: 3, uid: 10001 }]
```

##### [`DataView` get / set `Uint8Clamped` methods](https://github.com/tc39/proposal-dataview-get-set-uint8clamped)[⬆](#index)
Modules [`esnext.data-view.get-uint8-clamped`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.data-view.get-uint8-clamped.js) and [`esnext.data-view.set-uint8-clamped`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.data-view.set-uint8-clamped.js).
```ts
class DataView {
  getUint8Clamped(offset: any): uint8;
  setUint8Clamped(offset: any, value: any): void;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/data-view-get-set-uint8-clamped
core-js/full/data-view/get-uint8-clamped
core-js/full/data-view/set-uint8-clamped
```
[*Examples*](https://core-js.io/playground#code=const+view+%3D+new+DataView%28new+ArrayBuffer%281%29%29%3B%0Aview.setUint8Clamped%280%2C+100500%29%3B%0Aview.getUint8Clamped%280%29%3B+%2F%2F+%3D%3E+255):
```js
const view = new DataView(new ArrayBuffer(1));
view.setUint8Clamped(0, 100500);
view.getUint8Clamped(0); // => 255
```

##### [`String.cooked`](https://github.com/tc39/proposal-string-cooked)[⬆](#index)
Modules [`esnext.string.cooked`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.string.cooked.js).
```ts
class String {
  static cooked(template: Array<string>, ...substitutions: Array<string>): string;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/string-cooked
core-js(-pure)/full/string/cooked
```
[*Examples*](https://core-js.io/playground#code=function+safePath%28strings%2C+...subs%29+%7B%0A++return+String.cooked%28strings%2C+...subs.map%28sub+%3D%3E+encodeURIComponent%28sub%29%29%29%3B%0A%7D%0A%0Alet+id+%3D+%27spottie%3F%27%3B%0A%0AsafePath%60%2Fcats%2F%24%7B+id+%7D%60%3B+%2F%2F+%3D%3E+%2Fcats%2Fspottie%253F):
```js
function safePath(strings, ...subs) {
  return String.cooked(strings, ...subs.map(sub => encodeURIComponent(sub)));
}

let id = 'spottie?';

safePath`/cats/${ id }`; // => /cats/spottie%3F
```

##### [`Symbol.customMatcher` for pattern matching](https://github.com/tc39/proposal-pattern-matching)[⬆](#index)
Modules [`esnext.symbol.custom-matcher`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.custom-matcher.js).
```ts
class Symbol {
  static customMatcher: @@customMatcher;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/pattern-matching-v2
core-js(-pure)/full/symbol/custom-matcher
```

#### Stage 0 proposals[⬆](#index)
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/stage/0
```
##### [`Function.prototype.demethodize`](https://github.com/js-choi/proposal-function-demethodize)[⬆](#index)
Modules [`esnext.function.demethodize`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.function.demethodize.js).
```ts
class Function {
  demethodize(): Function;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/function-demethodize
core-js(-pure)/full/function/demethodize
core-js(-pure)/full/function/prototype/demethodize
```
[*Examples*](https://core-js.io/playground#code=const+slice+%3D+Array.prototype.slice.demethodize%28%29%3B%0A%0Aslice%28%5B1%2C+2%2C+3%5D%2C+1%29%3B+%2F%2F+%3D%3E+%5B2%2C+3%5D):
```js
const slice = Array.prototype.slice.demethodize();

slice([1, 2, 3], 1); // => [2, 3]
```

### Web standards[⬆](#index)
#### `self`[⬆](#index)
[Spec](https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-self), modules [`web.self`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.self.js).
```ts
getter self: GlobalThisValue;
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/stable|actual|full/self
```
[*Examples*](https://core-js.io/playground#code=%2F%2F+eslint-disable-next-line+no-restricted-globals+--+example%0Aself.Array+%3D%3D%3D+Array%3B+%2F%2F+%3D%3E+true):
```js
// eslint-disable-next-line no-restricted-globals -- example
self.Array === Array; // => true
```

#### `structuredClone`[⬆](#index)
[Spec](https://html.spec.whatwg.org/multipage/structured-data.html#dom-structuredclone), modules [`web.structured-clone`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.structured-clone.js).
```ts
function structuredClone(value: Serializable, { transfer?: Sequence<Transferable> }?): any;
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/stable|actual|full/structured-clone
```
[*Examples*](https://core-js.io/playground#code=const+structured+%3D+%5B%7B+a%3A+42+%7D%5D%3B%0Aconst+sclone+%3D+structuredClone%28structured%29%3B%0Asclone%3B++++++++++++++++++++++%2F%2F+%3D%3E+%5B%7B+a%3A+42+%7D%5D%0Astructured+%21%3D%3D+sclone%3B+++++++%2F%2F+%3D%3E+true%0Astructured%5B0%5D+%21%3D%3D+sclone%5B0%5D%3B+%2F%2F+%3D%3E+true%0A%0Aconst+circular+%3D+%7B%7D%3B%0Acircular.circular+%3D+circular%3B%0Aconst+cclone+%3D+structuredClone%28circular%29%3B%0Acclone.circular+%3D%3D%3D+cclone%3B++%2F%2F+%3D%3E+true%0A%0AstructuredClone%2842%29%3B++++++++++++++++++++++++++++++++++++++++++++%2F%2F+%3D%3E+42%0AstructuredClone%28%7B+x%3A+42+%7D%29%3B+++++++++++++++++++++++++++++++++++++%2F%2F+%3D%3E+%7B+x%3A+42+%7D%0AstructuredClone%28%5B1%2C+2%2C+3%5D%29%3B+++++++++++++++++++++++++++++++++++++%2F%2F+%3D%3E+%5B1%2C+2%2C+3%5D%0AstructuredClone%28new+Set%28%5B1%2C+2%2C+3%5D%29%29%3B++++++++++++++++++++++++++++%2F%2F+%3D%3E+Set+%7B+1%2C+2%2C+3+%7D%0AstructuredClone%28new+Map%28%5B%5B%27a%27%2C+1%5D%2C+%5B%27b%27%2C+2%5D%5D%29%29%3B+++++++++++++++++%2F%2F+%3D%3E+Map+%7B+%27a%27+%3D%3E+1%2C+%27b%27+%3D%3E+2+%7D%0AstructuredClone%28new+Int8Array%28%5B1%2C+2%2C+3%5D%29%29%3B++++++++++++++++++++++%2F%2F+%3D%3E+new+Int8Array%28%5B1%2C+2%2C+3%5D%29%0AstructuredClone%28new+AggregateError%28%5B1%2C+2%2C+3%5D%2C+%27message%27%29%29%3B++++++%2F%2F+%3D%3E+new+AggregateError%28%5B1%2C+2%2C+3%5D%2C+%27message%27%29%0AstructuredClone%28new+TypeError%28%27message%27%2C+%7B+cause%3A+42+%7D%29%29%3B+++++++%2F%2F+%3D%3E+new+TypeError%28%27message%27%2C+%7B+cause%3A+42+%7D%29%0AstructuredClone%28new+DOMException%28%27message%27%2C+%27DataCloneError%27%29%29%3B+%2F%2F+%3D%3E+new+DOMException%28%27message%27%2C+%27DataCloneError%27%29%0AstructuredClone%28document.getElementById%28%27myfileinput%27%29.files%29%3B++%2F%2F+%3D%3E+new+FileList%0AstructuredClone%28new+Date%280%29%29%3B+++++++++++++++++++++++++++++++++++%2F%2F+%3D%3E+new+Date%280%29%0AstructuredClone%28new+Blob%28%5B%27test%27%5D%29%29%3B++++++++++++++++++++++++++++%2F%2F+%3D%3E+new+Blob%28%5B%27test%27%5D%29%0AstructuredClone%28new+ImageData%288%2C+8%29%29%3B+++++++++++++++++++++++++++%2F%2F+%3D%3E+new+ImageData%288%2C+8%29%0A%2F%2F+etc.%0A%0AstructuredClone%28new+WeakMap%28%29%29%3B+%2F%2F+%3D%3E+DataCloneError+on+non-serializable+types):
```js
const structured = [{ a: 42 }];
const sclone = structuredClone(structured);
sclone;                      // => [{ a: 42 }]
structured !== sclone;       // => true
structured[0] !== sclone[0]; // => true

const circular = {};
circular.circular = circular;
const cclone = structuredClone(circular);
cclone.circular === cclone;  // => true

structuredClone(42);                                            // => 42
structuredClone({ x: 42 });                                     // => { x: 42 }
structuredClone([1, 2, 3]);                                     // => [1, 2, 3]
structuredClone(new Set([1, 2, 3]));                            // => Set { 1, 2, 3 }
structuredClone(new Map([['a', 1], ['b', 2]]));                 // => Map { 'a' => 1, 'b' => 2 }
structuredClone(new Int8Array([1, 2, 3]));                      // => new Int8Array([1, 2, 3])
structuredClone(new AggregateError([1, 2, 3], 'message'));      // => new AggregateError([1, 2, 3], 'message')
structuredClone(new TypeError('message', { cause: 42 }));       // => new TypeError('message', { cause: 42 })
structuredClone(new DOMException('message', 'DataCloneError')); // => new DOMException('message', 'DataCloneError')
structuredClone(document.getElementById('myfileinput').files);  // => new FileList
structuredClone(new Date(0));                                   // => new Date(0)
structuredClone(new Blob(['test']));                            // => new Blob(['test'])
structuredClone(new ImageData(8, 8));                           // => new ImageData(8, 8)
// etc.

structuredClone(new WeakMap()); // => DataCloneError on non-serializable types
```
> [!WARNING]
> - Many platform types cannot be transferred in most engines since we have no way to polyfill this behavior, however, the `transfer` option works for some platform types. I recommend avoiding this option.
> - Some specific platform types can't be cloned in old engines. Mostly these are very specific types or very old engines, but there are some exceptions. For example, we have no sync way to clone `ImageBitmap` in Safari 14.0- or Firefox 93-, so it's recommended to look at the [polyfill source](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.structured-clone.js) if you want to clone something specific.

#### Base64 utility methods[⬆](#index)
[Specification](https://html.spec.whatwg.org/multipage/webappapis.html#atob), [MDN](https://developer.mozilla.org/en-US/docs/Glossary/Base64). Modules [`web.atob`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.atob.js), [`web.btoa`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.btoa.js).
```ts
function atob(data: string): string;
function btoa(data: string): string;
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/stable|actual|full/atob
core-js(-pure)/stable|actual|full/btoa
```
[*Examples*](https://core-js.io/playground#code=btoa%28%27hi%2C+core-js%27%29%3B++++++%2F%2F+%3D%3E+%27aGksIGNvcmUtanM%3D%27%0Aatob%28%27aGksIGNvcmUtanM%3D%27%29%3B+%2F%2F+%3D%3E+%27hi%2C+core-js%27):
```js
btoa('hi, core-js');      // => 'aGksIGNvcmUtanM='
atob('aGksIGNvcmUtanM='); // => 'hi, core-js'
```

#### `setImmediate`[⬆](#index)
Modules [`web.set-immediate`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.set-immediate.js) and [`web.clear-immediate`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.clear-immediate.js). [`setImmediate`](https://w3c.github.io/setImmediate/) polyfill.
```ts
function setImmediate(callback: any, ...args: Array<mixed>): number;
function clearImmediate(id: number): void;
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/stable|actual|full/set-immediate
core-js(-pure)/stable|actual|full/clear-immediate
```
[*Examples*](https://core-js.io/playground#code=setImmediate%28%28arg1%2C+arg2%29+%3D%3E+%7B%0A++console.log%28arg1%2C+arg2%29%3B+%2F%2F+-%3E+Message+will+be+displayed+with+minimum+delay%0A%7D%2C+%27Message+will+be+displayed%27%2C+%27with+minimum+delay%27%29%3B%0A%0AclearImmediate%28setImmediate%28%28%29+%3D%3E+%7B%0A++console.log%28%27Message+will+not+be+displayed%27%29%3B%0A%7D%29%29%3B):
```js
setImmediate((arg1, arg2) => {
  console.log(arg1, arg2); // -> Message will be displayed with minimum delay
}, 'Message will be displayed', 'with minimum delay');

clearImmediate(setImmediate(() => {
  console.log('Message will not be displayed');
}));
```

#### `queueMicrotask`[⬆](#index)
[Spec](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-queuemicrotask), modules [`web.queue-microtask`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.queue-microtask.js).
```ts
function queueMicrotask(fn: Function): void;
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/stable|actual|full/queue-microtask
```
[*Examples*](https://core-js.io/playground#code=queueMicrotask%28%28%29+%3D%3E+console.log%28%27called+as+microtask%27%29%29%3B):
```js
queueMicrotask(() => console.log('called as microtask'));
```

#### `URL` and `URLSearchParams`[⬆](#index)
[`URL` standard](https://url.spec.whatwg.org/) implementation. Modules [`web.url.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.url.constructor.js), [`web.url.can-parse`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.url.can-parse.js), [`web.url.parse`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.url.parse.js), [`web.url.to-json`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.url.to-json.js), [`web.url-search-params.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.url-search-params.constructor.js), [`web.url-search-params.delete`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.url-search-params.delete.js), [`web.url-search-params.has`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.url-search-params.has.js), [`web.url-search-params.size`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.url-search-params.size.js).
```ts
class URL {
  constructor(url: string, base?: string);
  attribute href: string;
  readonly attribute origin: string;
  attribute protocol: string;
  attribute username: string;
  attribute password: string;
  attribute host: string;
  attribute hostname: string;
  attribute port: string;
  attribute pathname: string;
  attribute search: string;
  readonly attribute searchParams: URLSearchParams;
  attribute hash: string;
  toJSON(): string;
  toString(): string;
  static canParse(url: string, base?: string): boolean;
  static parse(url: string, base?: string): URL | null;
}

class URLSearchParams {
  constructor(params?: string | Iterable<[key, value]> | Object);
  append(name: string, value: string): void;
  delete(name: string, value?: string): void;
  get(name: string): string | null;
  getAll(name: string): Array<string>;
  has(name: string, value?: string): boolean;
  set(name: string, value: string): void;
  sort(): void;
  toString(): string;
  forEach(callbackfn: (value: any, key: string, target: any) => void, thisArg?: any): void;
  entries(): Iterator<[key, value]>;
  keys(): Iterator<key>;
  values(): Iterator<value>;
  @@iterator(): Iterator<[key, value]>;
  readonly attribute size: number;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/url
core-js(-pure)/stable|actual|full/url
core-js(-pure)/stable|actual|full/url/can-parse
core-js(-pure)/stable|actual|full/url/parse
core-js/stable|actual|full/url/to-json
core-js(-pure)/stable|actual|full/url-search-params
```
[*Examples*](https://core-js.io/playground#code=URL.canParse%28%27https%3A%2F%2Flogin%3Apassword%40example.com%3A8080%2F%3Fa%3D1%26b%3D2%26a%3D3%26c%3D4%23fragment%27%29%3B+%2F%2F+%3D%3E+true%0AURL.canParse%28%27https%27%29%3B+%2F%2F+%3D%3E+false%0A%0AURL.parse%28%27https%3A%2F%2Flogin%3Apassword%40example.com%3A8080%2F%3Fa%3D1%26b%3D2%26a%3D3%26c%3D4%23fragment%27%29%3B+%2F%2F+%3D%3E+url%0AURL.parse%28%27https%27%29%3B+%2F%2F+%3D%3E+null%0A%0Aconst+url+%3D+new+URL%28%27https%3A%2F%2Flogin%3Apassword%40example.com%3A8080%2Ffoo%2Fbar%3Fa%3D1%26b%3D2%26a%3D3%23fragment%27%29%3B%0A%0Aurl.href%3B+++++++%2F%2F+%3D%3E+%27https%3A%2F%2Flogin%3Apassword%40example.com%3A8080%2Ffoo%2Fbar%3Fa%3D1%26b%3D2%26a%3D3%23fragment%27%0Aurl.origin%3B+++++%2F%2F+%3D%3E+%27https%3A%2F%2Fexample.com%3A8080%27%0Aurl.protocol%3B+++%2F%2F+%3D%3E+%27https%3A%27%0Aurl.username%3B+++%2F%2F+%3D%3E+%27login%27%0Aurl.password%3B+++%2F%2F+%3D%3E+%27password%27%0Aurl.host%3B+++++++%2F%2F+%3D%3E+%27example.com%3A8080%27%0Aurl.hostname%3B+++%2F%2F+%3D%3E+%27example.com%27%0Aurl.port%3B+++++++%2F%2F+%3D%3E+%278080%27%0Aurl.pathname%3B+++%2F%2F+%3D%3E+%27%2Ffoo%2Fbar%27%0Aurl.search%3B+++++%2F%2F+%3D%3E+%27%3Fa%3D1%26b%3D2%26a%3D3%27%0Aurl.hash%3B+++++++%2F%2F+%3D%3E+%27%23fragment%27%0Aurl.toJSON%28%29%3B+++%2F%2F+%3D%3E+%27https%3A%2F%2Flogin%3Apassword%40example.com%3A8080%2Ffoo%2Fbar%3Fa%3D1%26b%3D2%26a%3D3%23fragment%27%0Aurl.toString%28%29%3B+%2F%2F+%3D%3E+%27https%3A%2F%2Flogin%3Apassword%40example.com%3A8080%2Ffoo%2Fbar%3Fa%3D1%26b%3D2%26a%3D3%23fragment%27%0A%0Afor+%28let+%5Bkey%2C+value%5D+of+url.searchParams%29+%7B%0A++console.log%28key%29%3B+++%2F%2F+-%3E+%27a%27%2C+%27b%27%2C+%27a%27%0A++console.log%28value%29%3B+%2F%2F+-%3E+%271%27%2C+%272%27%2C+%273%27%0A%7D%0A%0Aurl.pathname+%3D+%27%27%3B%0Aurl.searchParams.append%28%27c%27%2C+4%29%3B%0A%0Aurl.search%3B+%2F%2F+%3D%3E+%27%3Fa%3D1%26b%3D2%26a%3D3%26c%3D4%27%0Aurl.href%3B+++%2F%2F+%3D%3E+%27https%3A%2F%2Flogin%3Apassword%40example.com%3A8080%2F%3Fa%3D1%26b%3D2%26a%3D3%26c%3D4%23fragment%27%0A%0Aconst+params+%3D+new+URLSearchParams%28%27%3Fa%3D1%26b%3D2%26a%3D3%27%29%3B%0A%0Aparams.append%28%27c%27%2C+4%29%3B%0Aparams.append%28%27a%27%2C+2%29%3B%0Aparams.delete%28%27a%27%2C+1%29%3B%0Aparams.sort%28%29%3B%0A%0Aparams.size%3B+%2F%2F+%3D%3E+4%0A%0Afor+%28let+%5Bkey%2C+value%5D+of+params%29+%7B%0A++console.log%28key%29%3B+++%2F%2F+-%3E+%27a%27%2C+%27a%27%2C+%27b%27%2C+%27c%27%0A++console.log%28value%29%3B+%2F%2F+-%3E+%273%27%2C+%272%27%2C+%272%27%2C+%274%27%0A%7D%0A%0Aparams.has%28%27a%27%29%3B+%2F%2F+%3D%3E+true%0Aparams.has%28%27a%27%2C+3%29%3B+%2F%2F+%3D%3E+true%0Aparams.has%28%27a%27%2C+4%29%3B+%2F%2F+%3D%3E+false%0A%0Aparams.toString%28%29%3B+%2F%2F+%3D%3E+%27a%3D3%26a%3D2%26b%3D2%26c%3D4%27):
```js
URL.canParse('https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment'); // => true
URL.canParse('https'); // => false

URL.parse('https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment'); // => url
URL.parse('https'); // => null

const url = new URL('https://login:password@example.com:8080/foo/bar?a=1&b=2&a=3#fragment');

url.href;       // => 'https://login:password@example.com:8080/foo/bar?a=1&b=2&a=3#fragment'
url.origin;     // => 'https://example.com:8080'
url.protocol;   // => 'https:'
url.username;   // => 'login'
url.password;   // => 'password'
url.host;       // => 'example.com:8080'
url.hostname;   // => 'example.com'
url.port;       // => '8080'
url.pathname;   // => '/foo/bar'
url.search;     // => '?a=1&b=2&a=3'
url.hash;       // => '#fragment'
url.toJSON();   // => 'https://login:password@example.com:8080/foo/bar?a=1&b=2&a=3#fragment'
url.toString(); // => 'https://login:password@example.com:8080/foo/bar?a=1&b=2&a=3#fragment'

for (let [key, value] of url.searchParams) {
  console.log(key);   // -> 'a', 'b', 'a'
  console.log(value); // -> '1', '2', '3'
}

url.pathname = '';
url.searchParams.append('c', 4);

url.search; // => '?a=1&b=2&a=3&c=4'
url.href;   // => 'https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment'

const params = new URLSearchParams('?a=1&b=2&a=3');

params.append('c', 4);
params.append('a', 2);
params.delete('a', 1);
params.sort();

params.size; // => 4

for (let [key, value] of params) {
  console.log(key);   // -> 'a', 'a', 'b', 'c'
  console.log(value); // -> '3', '2', '2', '4'
}

params.has('a'); // => true
params.has('a', 3); // => true
params.has('a', 4); // => false

params.toString(); // => 'a=3&a=2&b=2&c=4'
```

> [!WARNING]
> - IE8 does not support setters, so they do not work on `URL` instances. However, the `URL` constructor can be used for basic `URL` parsing.
> - Legacy encodings in a search query are not supported. Also, the `core-js` implementation has some other encoding-related issues.
> - `URL` implementations from all of the popular browsers have significantly more problems than `core-js`, however, replacing all of them does not look like a good idea. You can customize the aggressiveness of the polyfill [to your requirements](#configurable-level-of-aggressiveness).

#### `DOMException`[⬆](#index)
[The specification.](https://webidl.spec.whatwg.org/#idl-DOMException) Modules [`web.dom-exception.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.dom-exception.constructor.js), [`web.dom-exception.stack`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.dom-exception.stack.js), [`web.dom-exception.to-string-tag`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.dom-exception.to-string-tag.js).
```ts
class DOMException {
  constructor(message?: string, name?: string);
  readonly attribute name: string;
  readonly attribute message: string;
  readonly attribute code: number;
  attribute stack: string; // in engines that should have it
  @@toStringTag: 'DOMException';
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/stable|actual|full/dom-exception
core-js(-pure)/stable|actual|full/dom-exception/constructor
```
[*Examples*](https://core-js.io/playground#code=const+exception+%3D+new+DOMException%28%27error%27%2C+%27DataCloneError%27%29%3B%0Aexception.name%3B++++++++++++++++++++++++++++%2F%2F+%3D%3E+%27DataCloneError%27%0Aexception.message%3B+++++++++++++++++++++++++%2F%2F+%3D%3E+%27error%27%0Aexception.code%3B++++++++++++++++++++++++++++%2F%2F+%3D%3E+25%0Atypeof+exception.stack%3B++++++++++++++++++++%2F%2F+%3D%3E+%27string%27%0Aexception+instanceof+DOMException%3B+++++++++%2F%2F+%3D%3E+true%0Aexception+instanceof+Error%3B++++++++++++++++%2F%2F+%3D%3E+true%0Aexception.toString%28%29%3B++++++++++++++++++++++%2F%2F+%3D%3E+%27DataCloneError%3A+error%27%0AObject.prototype.toString.call%28exception%29%3B+%2F%2F+%3D%3E+%27%5Bobject+DOMException%5D%27):
```js
const exception = new DOMException('error', 'DataCloneError');
exception.name;                            // => 'DataCloneError'
exception.message;                         // => 'error'
exception.code;                            // => 25
typeof exception.stack;                    // => 'string'
exception instanceof DOMException;         // => true
exception instanceof Error;                // => true
exception.toString();                      // => 'DataCloneError: error'
Object.prototype.toString.call(exception); // => '[object DOMException]'
```

#### Iterable DOM collections[⬆](#index)
Some DOM collections should have [iterable interface](https://webidl.spec.whatwg.org/#idl-iterable). `core-js` adds `@@iterator` to all of them and `forEach`, `keys`, `values` and `entries` methods to `DOMTokenList` and `NodeList`. Modules [`web.dom-collections.iterator`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.dom-collections.iterator.js), [`web.dom-collections.entries`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.dom-collections.entries.js), [`web.dom-collections.keys`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.dom-collections.keys.js), [`web.dom-collections.values`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.dom-collections.values.js) and [`web.dom-collections.for-each`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.dom-collections.for-each.js).
```ts
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
  forEach(callbackfn: (value: any, index: number, target: any) => void, thisArg?: any): void;
  entries(): Iterator<[key, value]>;
  keys(): Iterator<key>;
  values(): Iterator<value>;
  @@iterator(): Iterator<value>;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/stable|actual|full/dom-collections
core-js(-pure)/stable|actual|full/dom-collections/iterator
core-js/stable|actual|full/dom-collections/entries
core-js/stable|actual|full/dom-collections/keys
core-js/stable|actual|full/dom-collections/values
core-js/stable|actual|full/dom-collections/for-each
```
[*Examples*](https://core-js.io/playground#code=for+%28let+%7B+id+%7D+of+document.querySelectorAll%28%27%2A%27%29%29+%7B%0A++if+%28id%29+console.log%28id%29%3B%0A%7D%0A%0Afor+%28let+%5Bindex%2C+%7B+id+%7D%5D+of+document.querySelectorAll%28%27%2A%27%29.entries%28%29%29+%7B%0A++if+%28id%29+console.log%28index%2C+id%29%3B%0A%7D%0A%0Adocument.querySelectorAll%28%27%2A%27%29.forEach%28it+%3D%3E+console.log%28it.id%29%29%3B):
```js
for (let { id } of document.querySelectorAll('*')) {
  if (id) console.log(id);
}

for (let [index, { id }] of document.querySelectorAll('*').entries()) {
  if (id) console.log(index, id);
}

document.querySelectorAll('*').forEach(it => console.log(it.id));
```
### Iteration helpers[⬆](#index)
Helpers for checking iterability / getting an iterator in the `pure` version or, for example, for the `arguments` object:
```ts
function isIterable(value: any): boolean;
function getIterator(value: any): Object;
function getIteratorMethod(value: any): Function | void;
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/is-iterable
core-js(-pure)/es|stable|actual|full/get-iterator
core-js(-pure)/es|stable|actual|full/get-iterator-method
```
*Examples*:
```js
import isIterable from '@core-js/pure/actual/is-iterable';
import getIterator from '@core-js/pure/actual/get-iterator';
import getIteratorMethod from '@core-js/pure/actual/get-iterator-method';

let list = (function () {
  // eslint-disable-next-line prefer-rest-params -- example
  return arguments;
})(1, 2, 3);

isIterable(list); // => true

let iterator = getIterator(list);
iterator.next().value; // => 1
iterator.next().value; // => 2
iterator.next().value; // => 3
iterator.next().value; // => undefined

getIterator({}); // => TypeError: [object Object] is not iterable

let method = getIteratorMethod(list);
typeof method;         // => 'function'
iterator = method.call(list);
iterator.next().value; // => 1
iterator.next().value; // => 2
iterator.next().value; // => 3
iterator.next().value; // => undefined

getIteratorMethod({}); // => undefined
```

## Missing polyfills[⬆](#index)
- ES `BigInt` can't be polyfilled since it requires changes in the behavior of operators, you can find more info [here](https://github.com/zloirock/core-js/issues/381). You could try to use [`JSBI`](https://github.com/GoogleChromeLabs/jsbi).
- ES `Proxy` can't be polyfilled, you can try to use [`proxy-polyfill`](https://github.com/GoogleChrome/proxy-polyfill) which provides a very small subset of features.
- ES `String#normalize` is not a very useful feature, but this polyfill will be very large. If you need it, you can use [unorm](https://github.com/walling/unorm/).
- ECMA-402 `Intl` is missing because of its size. You can use [these polyfills](https://formatjs.github.io/docs/polyfills).
- `fetch` is not polyfilled: it depends on the networking of the platform, and now it's natively available in all modern browsers, Node.js 18+, Deno and Bun. For legacy engines, you can use, for example, [this polyfill](https://github.com/JakeChampion/fetch).
- ES `WeakRef` and `FinalizationRegistry` can't be polyfilled since they require integration with the garbage collector.
- ES `SharedArrayBuffer` and `Atomics` can't be polyfilled since they require memory shared between threads.
- ES resizable `ArrayBuffer`, growable `SharedArrayBuffer` and `Float16Array` are not polyfilled. `Math.f16round` and `DataView` methods for `float16` values are polyfilled.
- Some new ES `RegExp` syntax, like lookbehind assertions or `d` and `v` flags, is not polyfilled.
