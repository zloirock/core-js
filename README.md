# core-js

[![Sponsors on Open Collective](https://opencollective.com/core-js/sponsors/badge.svg)](#raising-funds) [![Backers on Open Collective](https://opencollective.com/core-js/backers/badge.svg)](#raising-funds) [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/zloirock/core-js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![version](https://img.shields.io/npm/v/core-js.svg)](https://www.npmjs.com/package/core-js) [![npm downloads](https://img.shields.io/npm/dm/core-js.svg)](https://npm-stat.com/charts.html?package=core-js&package=core-js-pure&package=core-js-compat&from=2014-11-18) [![tests](https://github.com/zloirock/core-js/workflows/tests/badge.svg)](https://github.com/zloirock/core-js/actions)
[![eslint](https://github.com/zloirock/core-js/workflows/eslint/badge.svg)](https://github.com/zloirock/core-js/actions)

> Modular standard library for JavaScript. Includes polyfills for [ECMAScript up to 2021](#ecmascript): [promises](#ecmascript-promise), [symbols](#ecmascript-symbol), [collections](#ecmascript-collections), iterators, [typed arrays](#ecmascript-typed-arrays), many other features, [ECMAScript proposals](#ecmascript-proposals), [some cross-platform WHATWG / W3C features and proposals](#web-standards) like [`URL`](#url-and-urlsearchparams). You can load only required features or use it without global namespace pollution.

**If you looking documentation for obsolete `core-js@2`, please, check [this branch](https://github.com/zloirock/core-js/tree/v2).**

## As advertising: the author is looking for a good job -)

## [core-js@3, babel and a look into the future](https://github.com/zloirock/core-js/tree/master/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md)

## Raising funds

`core-js` isn't backed by a company, so the future of this project depends on you. Become a sponsor or a backer [**on Open Collective**](https://opencollective.com/core-js) or [**on Patreon**](https://www.patreon.com/zloirock) if you are interested in `core-js`.

---

<a href="https://opencollective.com/core-js/sponsor/0/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/0/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/1/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/1/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/2/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/2/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/3/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/3/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/4/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/4/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/5/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/5/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/6/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/6/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/7/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/7/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/8/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/8/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/9/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/9/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/10/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/10/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/11/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/11/avatar.svg"></a>

---

<a href="https://opencollective.com/core-js#backers" target="_blank"><img src="https://opencollective.com/core-js/backers.svg?width=890"></a>

---

### For enterprise

Available as part of the Tidelift Subscription.

The maintainers of `core-js` and thousands of other packages are working with Tidelift to deliver commercial support and maintenance for the open source dependencies you use to build your applications. Save time, reduce risk, and improve code health, while paying the maintainers of the exact dependencies you use. [Learn more.](https://tidelift.com/subscription/pkg/npm-core-js?utm_source=npm-core-js&utm_medium=referral&utm_campaign=enterprise)

---

[*Example of usage*](http://goo.gl/a2xexl):
```js
import 'core-js'; // <- at the top of your entry point

Array.from(new Set([1, 2, 3, 2, 1]));          // => [1, 2, 3]
[1, [2, 3], [4, [5]]].flat(2);                 // => [1, 2, 3, 4, 5]
Promise.resolve(32).then(x => console.log(x)); // => 32
```

*You can load only required features*:
```js
import 'core-js/actual/array/from'; // <- at the top of your entry point
import 'core-js/actual/array/flat'; // <- at the top of your entry point
import 'core-js/actual/set';        // <- at the top of your entry point
import 'core-js/actual/promise';    // <- at the top of your entry point

Array.from(new Set([1, 2, 3, 2, 1]));          // => [1, 2, 3]
[1, [2, 3], [4, [5]]].flat(2);                 // => [1, 2, 3, 4, 5]
Promise.resolve(32).then(x => console.log(x)); // => 32
```

*Or use it without global namespace pollution*:
```js
import from from 'core-js-pure/actual/array/from';
import flat from 'core-js-pure/actual/array/flat';
import Set from 'core-js-pure/actual/set';
import Promise from 'core-js-pure/actual/promise';

from(new Set([1, 2, 3, 2, 1]));                // => [1, 2, 3]
flat([1, [2, 3], [4, [5]]], 2);                // => [1, 2, 3, 4, 5]
Promise.resolve(32).then(x => console.log(x)); // => 32
```

### Index
- [Usage](#usage)
  - [Installation](#installation)
  - [`postinstall` message](#postinstall-message)
  - [CommonJS API](#commonjs-api)
  - [Babel](#babel)
    - [`@babel/polyfill`](#babelpolyfill)
    - [`@babel/preset-env`](#babelpreset-env)
    - [`@babel/runtime`](#babelruntime)
  - [Configurable level of aggressiveness](#configurable-level-of-aggressiveness)
  - [Custom build](#custom-build)
  - [Compatibility data](#compatibility-data)
- [Supported engines](#supported-engines)
- [Features](#features)
  - [ECMAScript](#ecmascript)
    - [ECMAScript: Object](#ecmascript-object)
    - [ECMAScript: Function](#ecmascript-function)
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
    - [stage 4 proposals](#stage-4-proposals)
    - [stage 3 proposals](#stage-3-proposals)
    - [stage 2 proposals](#stage-2-proposals)
    - [stage 1 proposals](#stage-1-proposals)
    - [stage 0 proposals](#stage-0-proposals)
    - [pre-stage 0 proposals](#pre-stage-0-proposals)
  - [Web standards](#web-standards)
    - [`setTimeout` and `setInterval`](#settimeout-and-setinterval)
    - [`setImmediate`](#setimmediate)
    - [`queueMicrotask`](#queuemicrotask)
    - [`URL` and `URLSearchParams`](#url-and-urlsearchparams)
    - [iterable DOM collections](#iterable-dom-collections)
  - [Iteration helpers](#iteration-helpers)
- [Missing polyfills](#missing-polyfills)
- [Contributing](./CONTRIBUTING.md)
- [Security policy](https://github.com/zloirock/core-js/blob/master/SECURITY.md)
- [Changelog](./CHANGELOG.md)

## Usage[⬆](#index)
### Installation:[⬆](#index)
```
// global version
npm install --save core-js@3.9.1
// version without global namespace pollution
npm install --save core-js-pure@3.9.1
// bundled global version
npm install --save core-js-bundle@3.9.1
```

Already bundled version of `core-js` [on CDN](https://unpkg.com/core-js-bundle@3.9.1) ([minified version](https://unpkg.com/core-js-bundle@3.9.1/minified.js)).

### `postinstall` message[⬆](#index)
The `core-js` project needs your help, so the package shows a message about it after installation. If it causes problems for you, you can disable it:
```
ADBLOCK=true npm install
// or
DISABLE_OPENCOLLECTIVE=true npm install
// or
npm install --loglevel silent
```

### CommonJS API[⬆](#index)
You can import only-required-for-you polyfills, like in examples at the top of `README.md`. Available CommonJS entry points for all polyfilled methods / constructors and namespaces. Just some examples:

```js
// polyfill all `core-js` features:
import "core-js";
// polyfill all actual features - stable ES, web standards and stage 3 ES proposals:
import "core-js/actual";
// polyfill only stable features - ES and web standards:
import "core-js/stable";
// polyfill only stable ES features:
import "core-js/es";

// if you want to polyfill `Set`:
// all `Set`-related features, with ES proposals:
import "core-js/full/set";
// stable required for `Set` ES features, features from web standards and stage 3 ES proposals:
import "core-js/actual/set";
// stable required for `Set` ES features and features from web standards
// (DOM collections iterator in this case):
import "core-js/stable/set";
// only stable ES features required for `Set`:
import "core-js/es/set";
// the same without global namespace pollution:
import Set from "core-js-pure/full/set";
import Set from "core-js-pure/actual/set";
import Set from "core-js-pure/stable/set";
import Set from "core-js-pure/es/set";

// if you want to polyfill just required methods:
import "core-js/full/set/intersection";
import "core-js/actual/array/at";
import "core-js/stable/queue-microtask";
import "core-js/es/array/from";

// polyfill reflect metadata proposal:
import "core-js/proposals/reflect-metadata";
// polyfill all stage 2+ proposals:
import "core-js/stage/2";
```

##### Caveats when using CommonJS API:[⬆](#index)

* `modules` path is an internal API, does not inject all required dependencies and can be changed in minor or patch releases. Use it only for a custom build and/or if you know what are you doing.
* If you use `core-js` with the extension of native objects, recommended load all `core-js` modules at the top of the entry point of your application, otherwise, you can have conflicts.
  * For example, Google Maps use their own `Symbol.iterator`, conflicting with `Array.from`, `URLSearchParams` and/or something else from `core-js`, see [related issues](https://github.com/zloirock/core-js/search?q=Google+Maps&type=Issues).
  * Such conflicts also resolvable by discrovering and manual adding each conflicting entry from `core-js`.
* `core-js` is extremely modular and uses a lot of very tiny modules, because of that for usage in browsers bundle up `core-js` instead of usage loader for each file, otherwise, you will have hundreds of requests.

#### CommonJS and prototype methods without global namespace pollution[⬆](#index)
In the `pure` version, we can't pollute prototypes of native constructors. Because of that, prototype methods transformed into static methods like in examples above. But with transpilers, we can use one more trick - [bind operator and virtual methods](https://github.com/tc39/proposal-bind-operator). Special for that, available `/virtual/` entry points. Example:
```js
import fill from 'core-js-pure/full/array/virtual/fill';
import findIndex from 'core-js-pure/full/array/virtual/find-index';

Array(10)::fill(0).map((a, b) => b * b)::findIndex(it => it && !(it % 8)); // => 4
```

### Babel[⬆](#index)

`core-js` is integrated with `babel` and is the base for polyfilling-related `babel` features:

#### `@babel/polyfill`[⬆](#index)

[`@babel/polyfill`](http://babeljs.io/docs/usage/polyfill) [**IS** just the import of stable `core-js` features and `regenerator-runtime`](https://github.com/babel/babel/blob/c8bb4500326700e7dc68ce8c4b90b6482c48d82f/packages/babel-polyfill/src/index.js) for generators and async functions, so if you load `@babel/polyfill` - you load the global version of `core-js` without ES proposals.

Now it's deprecated in favour of separate inclusion of required parts of `core-js` and `regenerator-runtime` and, for preventing breaking changes, left on `core-js@2`.

As a full equal of `@babel/polyfill`, you can use this:
```js
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

#### `@babel/preset-env`[⬆](#index)

[`@babel/preset-env`](https://github.com/babel/babel/tree/master/packages/babel-preset-env) has `useBuiltIns` option, which optimizes working with global version of `core-js`. With `useBuiltIns` option, you should also set `corejs` option to used version of `core-js`, like `corejs: '3.9'`.

> **Warning!** Recommended to specify used minor `core-js` version, like `corejs: '3.9'`, instead of `corejs: 3`, since with `corejs: 3` will not be injected modules which were added in minor `core-js` releases.

- `useBuiltIns: 'entry'` replaces imports of `core-js` to import only required for a target environment modules. So, for example,
```js
import 'core-js/stable';
```
with `chrome 71` target will be replaced just to:
```js
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/web.clear-immediate";
import "core-js/modules/web.set-immediate";
```
It works for all entry points of global version of `core-js` and their combinations, for example for
```js
import 'core-js/es';
import 'core-js/proposals/set-methods';
import 'core-js/full/set/map';
```
with `chrome 71` target you will have as a result:
```js
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/esnext.set.difference";
import "core-js/modules/esnext.set.intersection";
import "core-js/modules/esnext.set.is-disjoint-from";
import "core-js/modules/esnext.set.is-subset-of";
import "core-js/modules/esnext.set.is-superset-of";
import "core-js/modules/esnext.set.map";
import "core-js/modules/esnext.set.symmetric-difference";
import "core-js/modules/esnext.set.union";
```

- `useBuiltIns: 'usage'` adds to the top of each file import of polyfills for features used in this file and not supported by target environments, so for:
```js
// first file:
var set = new Set([1, 2, 3]);

// second file:
var array = Array.of(1, 2, 3);
```
if target contains an old environment like `IE 11` we will have something like:
```js
// first file:
import 'core-js/modules/es.array.iterator';
import 'core-js/modules/es.object.to-string';
import 'core-js/modules/es.set';
var set = new Set([1, 2, 3]);

// second file:
import 'core-js/modules/es.array.of';
var array = Array.of(1, 2, 3);
```

By default, `@babel/preset-env` with `useBuiltIns: 'usage'` option only polyfills stable features, but you can enable polyfilling of proposals by `proposals` option, as `corejs: { version: '3.9', proposals: true }`.

#### `@babel/runtime`[⬆](#index)

[`@babel/runtime`](http://babeljs.io/docs/plugins/transform-runtime/) with `corejs: 3` option simplifies work with `core-js-pure`. It automatically replaces usage of modern features from JS standard library to imports from the version of `core-js` without global namespace pollution, so instead of:
```js
import from from 'core-js-pure/stable/array/from';
import flat from 'core-js-pure/stable/array/flat';
import Set from 'core-js-pure/stable/set';
import Promise from 'core-js-pure/stable/promise';

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

By default, `@babel/runtime` only polyfills stable features, but like in `@babel/preset-env`, you can enable polyfilling of proposals by `proposals` option, as `corejs: { version: 3, proposals: true }`.

> **Warning!** If you use `@babel/preset-env` and `@babel/runtime` together, use `corejs` option only in one place since it's duplicate functionality and will cause conflicts.

### Configurable level of aggressiveness[⬆](#index)

By default, `core-js` sets polyfills only when they are required. That means that `core-js` checks if a feature is available and works correctly or not and if it has no problems, `core-js` use native implementation.

But sometimes `core-js` feature detection could be too strict for your case. For example, `Promise` constructor requires the support of unhandled rejection tracking and `@@species`.

Sometimes we could have inverse problem - knowingly broken environment with problems not covered by `core-js` feature detection.

For those cases, we could redefine this behaviour for certain polyfills:

```js
const configurator = require('core-js/configurator');

configurator({
  useNative: ['Promise'],                                 // polyfills will be used only if natives completely unavailable
  usePolyfill: ['Array.from', 'String.prototype.padEnd'], // polyfills will be used anyway
  useFeatureDetection: ['Map', 'Set'],                    // default behaviour
});

require('core-js');
```

It does not work with some features. Also, if you change the default behaviour, even `core-js` internals may not work correctly.

### Custom build[⬆](#index)

For some cases could be useful to exclude some `core-js` features or generate a polyfill for target engines. You could use [`@core-js/builder`](/packages/core-js-builder) package for that.

### Compatibility data[⬆](#index)

[`@core-js/compat`](/packages/core-js-compat) package contains data about the necessity of `core-js` modules and API for getting a list of required `core-js` modules by `browserslist` query.

## Supported engines[⬆](#index)
**Tested in:**
- Chrome 26+
- Firefox 4+
- Safari 5.1+
- Opera 12+
- Internet Explorer 9+
- Edge
- iOS Safari 5.1+
- PhantomJS 2.1
- NodeJS 0.8+

...and it doesn't mean `core-js` will not work in other engines, they just have not been tested.

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
Modules [`es.object.assign`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.object.assign.js), [`es.object.is`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.object.is.js), [`es.object.set-prototype-of`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.object.set-prototype-of.js), [`es.object.to-string`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.object.to-string.js), [`es.object.freeze`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.object.freeze.js), [`es.object.seal`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.object.seal.js), [`es.object.prevent-extensions`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.object.prevent-extensions.js), [`es.object.is-frozen`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.object.is-frozen.js), [`es.object.is-sealed`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.object.is-sealed.js), [`es.object.is-extensible`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.object.is-extensible.js), [`es.object.get-own-property-descriptor`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.object.get-own-property-descriptor.js), [`es.object.get-own-property-descriptors`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.object.get-own-property-descriptors.js), [`es.object.get-prototype-of`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.object.get-prototype-of.js), [`es.object.keys`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.object.keys.js), [`es.object.values`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.object.values.js), [`es.object.entries`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.object.entries.js), [`es.object.get-own-property-names`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.object.get-own-property-names.js) and [`es.object.from-entries`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.object.from-entries.js).

[ES2017 Annex B](https://tc39.es/ecma262/#sec-object.prototype.__defineGetter__) - modules [`es.object.define-setter`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.object.define-setter.js), [`es.object.define-getter`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.object.define-getter.js), [`es.object.lookup-setter`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.object.lookup-setter.js) and [`es.object.lookup-getter`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.object.lookup-getter.js)
```js
class Object {
  toString(): string; // ES2015+ fix: @@toStringTag support
  __defineGetter__(property: PropertyKey, getter: Function): void;
  __defineSetter__(property: PropertyKey, setter: Function): void;
  __lookupGetter__(property: PropertyKey): Function | void;
  __lookupSetter__(property: PropertyKey): Function | void;
  static assign(target: Object, ...sources: Array<Object>): Object;
  static entries(object: Object): Array<[string, mixed]>;
  static freeze(object: any): any;
  static fromEntries(iterable: Iterable<[key, value]>): Object;
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
core-js(-pure)/es|stable|actual|full/object/keys
core-js(-pure)/es|stable|actual|full/object/values
core-js(-pure)/es|stable|actual|full/object/entries
core-js(-pure)/es|stable|actual|full/object/get-own-property-names
core-js(-pure)/es|stable|actual|full/object/freeze
core-js(-pure)/es|stable|actual|full/object/from-entries
core-js(-pure)/es|stable|actual|full/object/seal
core-js(-pure)/es|stable|actual|full/object/prevent-extensions
core-js(-pure)/es|stable|actual|full/object/is-frozen
core-js(-pure)/es|stable|actual|full/object/is-sealed
core-js(-pure)/es|stable|actual|full/object/is-extensible
core-js/es|stable|actual|full/object/to-string
core-js(-pure)/es|stable|actual|full/object/define-getter
core-js(-pure)/es|stable|actual|full/object/define-setter
core-js(-pure)/es|stable|actual|full/object/lookup-getter
core-js(-pure)/es|stable|actual|full/object/lookup-setter
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

let object = {
  [Symbol.toStringTag]: 'Foo'
};

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
```
#### ECMAScript: Function[⬆](#index)
Modules [`es.function.name`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.function.name.js) and [`es.function.has-instance`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.function.has-instance.js).
```js
class Function {
  name: string;
  @@hasInstance(value: any): boolean;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/es|stable|actual|full/function
core-js/es|stable|actual|full/function/name
core-js/es|stable|actual|full/function/has-instance
```
[*Example*](http://goo.gl/zqu3Wp):
```js
(function foo() {}).name // => 'foo'
```

#### ECMAScript: Array[⬆](#index)
Modules [`es.array.from`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.from.js), [`es.array.is-array`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.is-array.js), [`es.array.of`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.of.js), [`es.array.copy-within`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.copy-within.js), [`es.array.fill`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.fill.js), [`es.array.find`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.find.js), [`es.array.find-index`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.find-index.js), [`es.array.iterator`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.iterator.js), [`es.array.includes`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.includes.js), [`es.array.slice`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.slice.js), [`es.array.join`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.join.js), [`es.array.index-of`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.index-of.js), [`es.array.last-index-of`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.last-index-of.js), [`es.array.every`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.every.js), [`es.array.some`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.some.js), [`es.array.for-each`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.for-each.js), [`es.array.map`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.map.js), [`es.array.filter`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.filter.js), [`es.array.reduce`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.reduce.js), [`es.array.reduce-right`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.reduce-right.js), [`es.array.reverse`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.reverse.js), [`es.array.sort`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.sort.js), [`es.array.flat`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.flat.js), [`es.array.flat-map`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.flat-map.js), [`es.array.unscopables.flat`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.unscopables.flat.js) and [`es.array.unscopables.flat-map`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array.unscopables.flat-map.js)
```js
class Array {
  concat(...args: Array<mixed>): Array<mixed>; // with adding support of @@isConcatSpreadable and @@species
  copyWithin(target: number, start: number, end?: number): this;
  entries(): Iterator<[index, value]>;
  every(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): boolean;
  fill(value: any, start?: number, end?: number): this;
  filter(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): Array<mixed>; // with adding support of @@species
  find(callbackfn: (value: any, index: number, target: any) => boolean), thisArg?: any): any;
  findIndex(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): number;
  flat(depthArg?: number = 1): Array<mixed>;
  flatMap(mapFn: (value: any, index: number, target: any) => any, thisArg: any): Array<mixed>;
  forEach(callbackfn: (value: any, index: number, target: any) => void, thisArg?: any): void;
  includes(searchElement: any, from?: number): boolean;
  indexOf(searchElement: any, from?: number): number;
  join(separator: string = ','): string;
  keys(): Iterator<index>;
  lastIndexOf(searchElement: any, from?: number): number;
  map(mapFn: (value: any, index: number, target: any) => any, thisArg?: any): Array<mixed>; // with adding support of @@species
  reduce(callbackfn: (memo: any, value: any, index: number, target: any) => any, initialValue?: any): any;
  reduceRight(callbackfn: (memo: any, value: any, index: number, target: any) => any, initialValue?: any): any;
  reverse(): this; // Safari 12.0 bug fix
  slice(start?: number, end?: number): Array<mixed>; // with adding support of @@species
  splice(start?: number, deleteCount?: number, ...items: Array<mixed>): Array<mixed>; // with adding support of @@species
  some(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): boolean;
  sort(comparefn?: (a: any, b: any) => number): this;
  values(): Iterator<value>;
  @@iterator(): Iterator<value>;
  @@unscopables: { [newMethodNames: string]: true };
  static from(items: Iterable | ArrayLike, mapFn?: (value: any, index: number) => any, thisArg?: any): Array<mixed>;
  static of(...args: Array<mixed>): Array<mixed>;
}

class Arguments {
  @@iterator(): Iterator<value>; // available only in core-js methods
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/array
core-js(-pure)/es|stable|actual|full/array/from
core-js(-pure)/es|stable|actual|full/array/of
core-js(-pure)/es|stable|actual|full/array/is-array
core-js(-pure)/es|stable|actual|full/array/concat
core-js(-pure)/es|stable|actual|full/array/entries
core-js(-pure)/es|stable|actual|full/array/every
core-js(-pure)/es|stable|actual|full/array/copy-within
core-js(-pure)/es|stable|actual|full/array/fill
core-js(-pure)/es|stable|actual|full/array/filter
core-js(-pure)/es|stable|actual|full/array/find
core-js(-pure)/es|stable|actual|full/array/find-index
core-js(-pure)/es|stable|actual|full/array/flat
core-js(-pure)/es|stable|actual|full/array/flat-map
core-js(-pure)/es|stable|actual|full/array/for-each
core-js(-pure)/es|stable|actual|full/array/includes
core-js(-pure)/es|stable|actual|full/array/index-of
core-js(-pure)/es|stable|actual|full/array/iterator
core-js(-pure)/es|stable|actual|full/array/join
core-js(-pure)/es|stable|actual|full/array/keys
core-js(-pure)/es|stable|actual|full/array/last-index-of
core-js(-pure)/es|stable|actual|full/array/map
core-js(-pure)/es|stable|actual|full/array/reduce
core-js(-pure)/es|stable|actual|full/array/reduce-right
core-js(-pure)/es|stable|actual|full/array/reverse
core-js(-pure)/es|stable|actual|full/array/slice
core-js(-pure)/es|stable|actual|full/array/splice
core-js(-pure)/es|stable|actual|full/array/some
core-js(-pure)/es|stable|actual|full/array/sort
core-js(-pure)/es|stable|actual|full/array/values
core-js(-pure)/es|stable|actual|full/array/virtual/concat
core-js(-pure)/es|stable|actual|full/array/virtual/copy-within
core-js(-pure)/es|stable|actual|full/array/virtual/entries
core-js(-pure)/es|stable|actual|full/array/virtual/every
core-js(-pure)/es|stable|actual|full/array/virtual/fill
core-js(-pure)/es|stable|actual|full/array/virtual/filter
core-js(-pure)/es|stable|actual|full/array/virtual/find
core-js(-pure)/es|stable|actual|full/array/virtual/find-index
core-js(-pure)/es|stable|actual|full/array/virtual/flat
core-js(-pure)/es|stable|actual|full/array/virtual/flat-map
core-js(-pure)/es|stable|actual|full/array/virtual/for-each
core-js(-pure)/es|stable|actual|full/array/virtual/includes
core-js(-pure)/es|stable|actual|full/array/virtual/index-of
core-js(-pure)/es|stable|actual|full/array/virtual/iterator
core-js(-pure)/es|stable|actual|full/array/virtual/join
core-js(-pure)/es|stable|actual|full/array/virtual/keys
core-js(-pure)/es|stable|actual|full/array/virtual/last-index-of
core-js(-pure)/es|stable|actual|full/array/virtual/map
core-js(-pure)/es|stable|actual|full/array/virtual/reduce
core-js(-pure)/es|stable|actual|full/array/virtual/reduce-right
core-js(-pure)/es|stable|actual|full/array/virtual/reverse
core-js(-pure)/es|stable|actual|full/array/virtual/slice
core-js(-pure)/es|stable|actual|full/array/virtual/some
core-js(-pure)/es|stable|actual|full/array/virtual/sort
core-js(-pure)/es|stable|actual|full/array/virtual/splice
core-js(-pure)/es|stable|actual|full/array/virtual/values
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

[1, [2, 3], [4, 5]].flat();    // => [1, 2, 3, 4, 5]
[1, [2, [3, [4]]], 5].flat();  // => [1, 2, [3, [4]], 5]
[1, [2, [3, [4]]], 5].flat(3); // => [1, 2, 3, 4, 5]

[{ a: 1, b: 2 }, { a: 3, b: 4 }, { a: 5, b: 6 }].flatMap(it => [it.a, it.b]); // => [1, 2, 3, 4, 5, 6]
```

#### ECMAScript: String and RegExp[⬆](#index)
The main part of `String` features: modules [`es.string.from-code-point`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.from-code-point.js), [`es.string.raw`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.raw.js), [`es.string.iterator`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.iterator.js), [`es.string.split`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.split.js), [`es.string.code-point-at`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.code-point-at.js), [`es.string.ends-with`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.ends-with.js), [`es.string.includes`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.includes.js), [`es.string.repeat`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.repeat.js), [`es.string.pad-start`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.pad-start.js), [`es.string.pad-end`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.pad-end.js), [`es.string.starts-with`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.starts-with.js), [`es.string.trim`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.trim.js), [`es.string.trim-end`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.trim-end.js), [`es.string.trim-left`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.trim-left.js), [`es.string.trim-right`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.trim-right.js), [`es.string.trim-start`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.trim-start.js), [`es.string.match-all`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.match-all.js), [`es.string.replace-all`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.replace-all.js).

Adding support of well-known [symbols](#ecmascript-symbol) `@@match`, `@@replace`, `@@search` and `@@split` and direct `.exec` calls to related `String` methods, modules [`es.string.match`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.match.js), [`es.string.replace`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.replace.js), [`es.string.search`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.search.js) and [`es.string.split`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.split.js).

Annex B HTML methods. Ugly, but it's also the part of the spec. Modules [`es.string.anchor`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.anchor.js), [`es.string.big`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.big.js), [`es.string.blink`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.blink.js), [`es.string.bold`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.bold.js), [`es.string.fixed`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.fixed.js), [`es.string.fontcolor`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.fontcolor.js), [`es.string.fontsize`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.fontsize.js), [`es.string.italics`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.italics.js), [`es.string.link`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.link.js), [`es.string.small`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.small.js), [`es.string.strike`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.strike.js), [`es.string.sub`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.sub.js) and [`es.string.sup`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.string.sup.js).

`RegExp` features: modules [`es.regexp.constructor`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.regexp.constructor.js), [`es.regexp.flags`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.regexp.flags.js), [`es.regexp.sticky`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.regexp.sticky.js) and [`es.regexp.test`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.regexp.test.js).
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
  match(template: any): any; // ES2015+ fix for support @@match
  matchAll(regexp: RegExp): Iterator;
  replace(template: any, replacer: any): any; // ES2015+ fix for support @@replace
  replaceAll(searchValue: string | RegExp, replaceString: string | (searchValue, index, this) => string): string;
  search(template: any): any; // ES2015+ fix for support @@search
  split(template: any, limit: any): any; // ES2015+ fix for support @@split, some fixes for old engines
  trim(): string;
  trimLeft(): string;
  trimRight(): string;
  trimStart(): string;
  trimEnd(): string;
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
  constructor(pattern: RegExp | string, flags?: string): RegExp; // support of sticky (`y`) flag; can alter flags
  exec(): Array<string | undefined> | null; // IE8 fixes
  test(string: string): boolean; // delegation to `.exec`
  toString(): string; // ES2015+ fix - generic
  @@match(string: string): Array | null;
  @@replace(string: string, replaceValue: Function | string): string;
  @@search(string: string): number;
  @@split(string: string, limit: number): Array<string>;
  readonly attribute flags: string; // IE9+
  readonly attribute sticky: boolean;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/string
core-js(-pure)/es|stable|actual|full/string/from-code-point
core-js(-pure)/es|stable|actual|full/string/raw
core-js(-pure)/es|stable|actual|full/string/code-point-at
core-js(-pure)/es|stable|actual|full/string/ends-with
core-js(-pure)/es|stable|actual|full/string/includes
core-js(-pure)/es|stable|actual|full/string/starts-with
core-js/es|stable|actual|full/string/match
core-js(-pure)/es|stable|actual|full/string/match-all
core-js(-pure)/es|stable|actual|full/string/pad-start
core-js(-pure)/es|stable|actual|full/string/pad-end
core-js(-pure)/es|stable|actual|full/string/repeat
core-js/es|stable|actual|full/string/replace
core-js(-pure)/es|stable|actual|full/string/replace-all
core-js/es|stable|actual|full/string/search
core-js/es|stable|actual|full/string/split
core-js(-pure)/es|stable|actual|full/string/trim
core-js(-pure)/es|stable|actual|full/string/trim-start
core-js(-pure)/es|stable|actual|full/string/trim-end
core-js(-pure)/es|stable|actual|full/string/trim-left
core-js(-pure)/es|stable|actual|full/string/trim-right
core-js(-pure)/es|stable|actual|full/string/anchor
core-js(-pure)/es|stable|actual|full/string/big
core-js(-pure)/es|stable|actual|full/string/blink
core-js(-pure)/es|stable|actual|full/string/bold
core-js(-pure)/es|stable|actual|full/string/fixed
core-js(-pure)/es|stable|actual|full/string/fontcolor
core-js(-pure)/es|stable|actual|full/string/fontsize
core-js(-pure)/es|stable|actual|full/string/italics
core-js(-pure)/es|stable|actual|full/string/link
core-js(-pure)/es|stable|actual|full/string/small
core-js(-pure)/es|stable|actual|full/string/strike
core-js(-pure)/es|stable|actual|full/string/sub
core-js(-pure)/es|stable|actual|full/string/sup
core-js(-pure)/es|stable|actual|full/string/iterator
core-js(-pure)/es|stable|actual|full/string/virtual/includes
core-js(-pure)/es|stable|actual|full/string/virtual/starts-with
core-js(-pure)/es|stable|actual|full/string/virtual/ends-with
core-js(-pure)/es|stable|actual|full/string/virtual/match-all
core-js(-pure)/es|stable|actual|full/string/virtual/repeat
core-js(-pure)/es|stable|actual|full/string/virtual/replace-all
core-js(-pure)/es|stable|actual|full/string/virtual/pad-start
core-js(-pure)/es|stable|actual|full/string/virtual/pad-end
core-js(-pure)/es|stable|actual|full/string/virtual/code-point-at
core-js(-pure)/es|stable|actual|full/string/virtual/trim
core-js(-pure)/es|stable|actual|full/string/virtual/trim-start
core-js(-pure)/es|stable|actual|full/string/virtual/trim-end
core-js(-pure)/es|stable|actual|full/string/virtual/trim-left
core-js(-pure)/es|stable|actual|full/string/virtual/trim-right
core-js(-pure)/es|stable|actual|full/string/virtual/anchor
core-js(-pure)/es|stable|actual|full/string/virtual/big
core-js(-pure)/es|stable|actual|full/string/virtual/blink
core-js(-pure)/es|stable|actual|full/string/virtual/bold
core-js(-pure)/es|stable|actual|full/string/virtual/fixed
core-js(-pure)/es|stable|actual|full/string/virtual/fontcolor
core-js(-pure)/es|stable|actual|full/string/virtual/fontsize
core-js(-pure)/es|stable|actual|full/string/virtual/italics
core-js(-pure)/es|stable|actual|full/string/virtual/link
core-js(-pure)/es|stable|actual|full/string/virtual/small
core-js(-pure)/es|stable|actual|full/string/virtual/strike
core-js(-pure)/es|stable|actual|full/string/virtual/sub
core-js(-pure)/es|stable|actual|full/string/virtual/sup
core-js(-pure)/es|stable|actual|full/string/virtual/iterator
core-js/es|stable|actual|full/regexp
core-js/es|stable|actual|full/regexp/constructor
core-js(-pure)/es|stable|actual|full/regexp/flags
core-js/es|stable|actual|full/regexp/sticky
core-js/es|stable|actual|full/regexp/test
core-js/es|stable|actual|full/regexp/to-string
```
[*Examples*](http://es6.zloirock.ru/#for(var%20val%20of%20'a%F0%A0%AE%B7b')%7B%0A%20%20log(val)%3B%20%2F%2F%20%3D%3E%20'a'%2C%20'%F0%A0%AE%B7'%2C%20'b'%0A%7D%0A%0Alog('foobarbaz'.includes('bar'))%3B%20%20%20%20%20%20%2F%2F%20%3D%3E%20true%0Alog('foobarbaz'.includes('bar'%2C%204))%3B%20%20%20%2F%2F%20%3D%3E%20false%0Alog('foobarbaz'.startsWith('foo'))%3B%20%20%20%20%2F%2F%20%3D%3E%20true%0Alog('foobarbaz'.startsWith('bar'%2C%203))%3B%20%2F%2F%20%3D%3E%20true%0Alog('foobarbaz'.endsWith('baz'))%3B%20%20%20%20%20%20%2F%2F%20%3D%3E%20true%0Alog('foobarbaz'.endsWith('bar'%2C%206))%3B%20%20%20%2F%2F%20%3D%3E%20true%0A%0Alog('string'.repeat(3))%3B%20%2F%2F%20%3D%3E%20'stringstringstring'%0A%0Alog('hello'.padStart(10))%3B%20%20%20%20%20%20%20%20%20%2F%2F%20%3D%3E%20'%20%20%20%20%20hello'%0Alog('hello'.padStart(10%2C%20'1234'))%3B%20%2F%2F%20%3D%3E%20'12341hello'%0Alog('hello'.padEnd(10))%3B%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20%3D%3E%20'hello%20%20%20%20%20'%0Alog('hello'.padEnd(10%2C%20'1234'))%3B%20%20%20%2F%2F%20%3D%3E%20'hello12341'%0A%0Alog('%F0%A0%AE%B7'.codePointAt(0))%3B%20%2F%2F%20%3D%3E%20134071%0A%0Avar%20name%20%3D%20'Bob'%3B%0Alog(String.raw%60Hi%5Cn%24%7Bname%7D!%60)%3B%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20%3D%3E%20'Hi%5C%5CnBob!'%20(ES6%20template%20string%20syntax)%0Alog(String.raw(%7B%20raw%3A%20'test'%20%7D%2C%200%2C%201%2C%202))%3B%20%2F%2F%20%3D%3E%20%2F%2F%20't0e1s2t'%0A%0Alog('foo'.bold())%3B%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20%3D%3E%20'%3Cb%3Efoo%3C%2Fb%3E'%0Alog('bar'.anchor('a%22b'))%3B%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20%3D%3E%20'%3Ca%20name%3D%22a%26quot%3Bb%22%3Ebar%3C%2Fa%3E'%0Alog('baz'.link('http%3A%2F%2Fexample.com'))%3B%20%2F%2F%20%3D%3E%20'%3Ca%20href%3D%22http%3A%2F%2Fexample.com%22%3Ebaz%3C%2Fa%3E'%0A%0Alog(RegExp(%2F.%2Fg%2C%20'm'))%3B%20%2F%2F%20%3D%3E%20%2F.%2Fm%0A%0Alog(%2Ffoo%2F.flags)%3B%20%20%20%20%2F%2F%20%3D%3E%20''%0Alog(%2Ffoo%2Fgim.flags)%3B%20%2F%2F%20%3D%3E%20'gim'%0A%0Alog(RegExp('foo'%2C%20'y').sticky)%3B%20%2F%2F%20%3D%3E%20true%0A%0Aconst%20text%20%3D%20'First%20line%5CnSecond%20line'%3B%0Aconst%20regex%20%3D%20RegExp('(%5C%5CS%2B)%20line%5C%5Cn%3F'%2C%20'y')%3B%0A%0Alog(regex.exec(text)%5B1%5D)%3B%20%2F%2F%20%3D%3E%20'First'%0Alog(regex.exec(text)%5B1%5D)%3B%20%2F%2F%20%3D%3E%20'Second'%0Alog(regex.exec(text))%3B%20%20%20%20%2F%2F%20%3D%3E%20null%0A%0Alog('foo'.match(%7B%5BSymbol.match%5D%3A%20_%20%3D%3E%201%7D))%3B%20%20%20%20%20%2F%2F%20%3D%3E%201%0Alog('foo'.replace(%7B%5BSymbol.replace%5D%3A%20_%20%3D%3E%202%7D))%3B%20%2F%2F%20%3D%3E%202%0Alog('foo'.search(%7B%5BSymbol.search%5D%3A%20_%20%3D%3E%203%7D))%3B%20%20%20%2F%2F%20%3D%3E%203%0Alog('foo'.split(%7B%5BSymbol.split%5D%3A%20_%20%3D%3E%204%7D))%3B%20%20%20%20%20%2F%2F%20%3D%3E%204%0A%0Alog(RegExp.prototype.toString.call(%7Bsource%3A%20'foo'%2C%20flags%3A%20'bar'%7D))%3B%0A%0Alog('%20%20%20hello%20%20%20'.trimLeft())%3B%20%20%2F%2F%20%3D%3E%20'hello%20%20%20'%0Alog('%20%20%20hello%20%20%20'.trimRight())%3B%20%2F%2F%20%3D%3E%20'%20%20%20hello'%0Alog('%20%20%20hello%20%20%20'.trimStart())%3B%20%2F%2F%20%3D%3E%20'hello%20%20%20'%0Alog('%20%20%20hello%20%20%20'.trimEnd())%3B%20%20%20%2F%2F%20%3D%3E%20'%20%20%20hello'%0A%0Afor%20(let%20%5B_%2C%20d%2C%20D%5D%20of%20'1111a2b3cccc'.matchAll(%2F(%5Cd)(%5CD)%2Fg))%20%7B%0A%20%20log(d%2C%20D)%3B%20%2F%2F%20%3D%3E%201%20a%2C%202%20b%2C%203%20c%0A%7D%0A%0Alog('Test%20abc%20test%20test%20abc%20test.'.replaceAll('abc'%2C%20'foo'))%3B%20%2F%2F%20-%3E%20'Test%20foo%20test%20test%20foo%20test.'):
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

RegExp(/./g, 'm'); // => /./m

/foo/.flags;    // => ''
/foo/gim.flags; // => 'gim'

RegExp('foo', 'y').sticky; // => true

const text = 'First line\nSecond line';
const regex = RegExp('(\\S+) line\\n?', 'y');

regex.exec(text)[1]; // => 'First'
regex.exec(text)[1]; // => 'Second'
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

for (let [_, d, D] of '1111a2b3cccc'.matchAll(/(\d)(\D)/g)) {
  console.log(d, D); // => 1 a, 2 b, 3 c
}

'Test abc test test abc test.'.replaceAll('abc', 'foo'); // -> 'Test foo test test foo test.'
```
#### ECMAScript: Number[⬆](#index)
Module [`es.number.constructor`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.number.constructor.js). `Number` constructor support binary and octal literals, [*example*](http://goo.gl/jRd6b3):
```js
Number('0b1010101'); // => 85
Number('0o7654321'); // => 2054353
```
Modules [`es.number.epsilon`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.number.epsilon.js), [`es.number.is-finite`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.number.is-finite.js), [`es.number.is-integer`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.number.is-integer.js), [`es.number.is-nan`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.number.is-nan.js), [`es.number.is-safe-integer`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.number.is-safe-integer.js), [`es.number.max-safe-integer`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.number.max-safe-integer.js), [`es.number.min-safe-integer`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.number.min-safe-integer.js), [`es.number.parse-float`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.number.parse-float.js), [`es.number.parse-int`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.number.parse-int.js), [`es.number.to-fixed`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.number.to-fixed.js), [`es.number.to-precision`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.number.to-precision.js), [`es.parse-int`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.parse-int.js), [`es.parse-float`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.parse-float.js).
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
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/number
core-js/es|stable|actual|full/number/constructor
core-js(-pure)/es|stable|actual|full/number/is-finite
core-js(-pure)/es|stable|actual|full/number/is-nan
core-js(-pure)/es|stable|actual|full/number/is-integer
core-js(-pure)/es|stable|actual|full/number/is-safe-integer
core-js(-pure)/es|stable|actual|full/number/parse-float
core-js(-pure)/es|stable|actual|full/number/parse-int
core-js(-pure)/es|stable|actual|full/number/epsilon
core-js(-pure)/es|stable|actual|full/number/max-safe-integer
core-js(-pure)/es|stable|actual|full/number/min-safe-integer
core-js(-pure)/es|stable|actual|full/number/to-fixed
core-js(-pure)/es|stable|actual|full/number/to-precision
core-js(-pure)/es|stable|actual|full/parse-float
core-js(-pure)/es|stable|actual|full/parse-int
```
#### ECMAScript: Math[⬆](#index)
Modules [`es.math.acosh`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.math.acosh.js), [`es.math.asinh`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.math.asinh.js), [`es.math.atanh`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.math.atanh.js), [`es.math.cbrt`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.math.cbrt.js), [`es.math.clz32`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.math.clz32.js), [`es.math.cosh`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.math.cosh.js), [`es.math.expm1`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.math.expm1.js), [`es.math.fround`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.math.fround.js), [`es.math.hypot`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.math.hypot.js), [`es.math.imul`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.math.imul.js), [`es.math.log10`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.math.log10.js), [`es.math.log1p`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.math.log1p.js), [`es.math.log2`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.math.log2.js), [`es.math.sign`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.math.sign.js), [`es.math.sinh`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.math.sinh.js), [`es.math.tanh`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.math.tanh.js), [`es.math.trunc`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.math.trunc.js).
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
core-js(-pure)/es|stable|actual|full/math/hypot
core-js(-pure)/es|stable|actual|full/math/imul
core-js(-pure)/es|stable|actual|full/math/log1p
core-js(-pure)/es|stable|actual|full/math/log10
core-js(-pure)/es|stable|actual|full/math/log2
core-js(-pure)/es|stable|actual|full/math/sign
core-js(-pure)/es|stable|actual|full/math/sinh
core-js(-pure)/es|stable|actual|full/math/tanh
core-js(-pure)/es|stable|actual|full/math/trunc
```
#### ECMAScript: Date[⬆](#index)
Modules [`es.date.to-string`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.date.to-string.js), ES5 features with fixes: [`es.date.to-iso-string`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.date.to-iso-string.js), [`es.date.to-json`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.date.to-json.js) and [`es.date.to-primitive`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.date.to-primitive.js).
```js
class Date {
  toISOString(): string;
  toJSON(): string;
  toString(): string;
  @@toPrimitive(hint: 'default' | 'number' | 'string'): string | number;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/es|stable|actual|full/date
core-js/es|stable|actual|full/date/to-string
core-js(-pure)/es|stable|actual|full/date/to-iso-string
core-js(-pure)/es|stable|actual|full/date/to-json
core-js(-pure)/es|stable|actual|full/date/to-primitive
```
[*Example*](http://goo.gl/haeHLR):
```js
new Date(NaN).toString(); // => 'Invalid Date'
```
#### ECMAScript: Promise[⬆](#index)
Modules [`es.aggregate-error`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.aggregate-error.js), [`es.promise.constructor`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.promise.js), [`es.promise.all`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.promise.all.js), [`es.promise.all-settled`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.promise.all-settled.js), [`es.promise.any`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.promise.any.js), [`es.promise.catch`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.promise.catch.js), [`es.promise.finally`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.promise.finally.js), [`es.promise.race`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.promise.race.js), [`es.promise.reject`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.promise.reject.js) and [`es.promise.resolve`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.promise.resolve.js).
```js
class AggregateError {
  constructor(errors: Iterable, message: string): AggregateError;
  errors: Array<any>;
  message: string;
}

class Promise {
  constructor(executor: (resolve: Function, reject: Function) => void): Promise;
  then(onFulfilled: Function, onRejected: Function): Promise;
  catch(onRejected: Function): Promise;
  finally(onFinally: Function): Promise;
  static all(iterable: Iterable): Promise;
  static allSettled(iterable: Iterable): Promise;
  static any(promises: Iterable): Promise<any>;
  static race(iterable: Iterable): Promise;
  static reject(r: any): Promise;
  static resolve(x: any): Promise;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/aggregate-error
core-js(-pure)/es|stable|actual|full/promise
core-js(-pure)/es|stable|actual|full/promise/constructor
core-js(-pure)/es|stable|actual|full/promise/all
core-js(-pure)/es|stable|actual|full/promise/all-settled
core-js(-pure)/es|stable|actual|full/promise/any
core-js(-pure)/es|stable|actual|full/promise/catch
core-js(-pure)/es|stable|actual|full/promise/finally
core-js(-pure)/es|stable|actual|full/promise/race
core-js(-pure)/es|stable|actual|full/promise/reject
core-js(-pure)/es|stable|actual|full/promise/resolve
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
`Promise#finally` [*example*](https://goo.gl/AhyBbJ):
```js
Promise.resolve(42).finally(() => console.log('You will see it anyway'));

Promise.reject(42).finally(() => console.log('You will see it anyway'));
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
`Promise.allSettled` [*example*](https://goo.gl/PXXLNJ):
```js
Promise.allSettled([
  Promise.resolve(1),
  Promise.reject(2),
  Promise.resolve(3),
]).then(console.log); // => [{ value: 1, status: 'fulfilled' }, { reason: 2, status: 'rejected' }, { value: 3, status: 'fulfilled' }]
```
`Promise.any` [*example*](https://goo.gl/iErvmp):
```js
Promise.any([
  Promise.resolve(1),
  Promise.reject(2),
  Promise.resolve(3),
]).then(console.log); // => 1

Promise.any([
  Promise.reject(1),
  Promise.reject(2),
  Promise.reject(3),
]).catch(({ errors }) => console.log(errors)); // => [1, 2, 3]
```
[Example](http://goo.gl/wnQS4j) with async functions:
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

##### Unhandled rejection tracking[⬆](#index)

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

#### ECMAScript: Symbol[⬆](#index)
Modules [`es.symbol`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.symbol.js), [`es.symbol.async-iterator`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.symbol.async-iterator.js), [`es.symbol.description`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.symbol.description.js), [`es.symbol.has-instance`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.symbol.has-instance.js), [`es.symbol.is-concat-spreadable`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.symbol.is-concat-spreadable.js), [`es.symbol.iterator`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.symbol.iterator.js), [`es.symbol.match`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.symbol.match.js), [`es.symbol.replace`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.symbol.replace.js), [`es.symbol.search`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.symbol.search.js), [`es.symbol.species`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.symbol.species.js), [`es.symbol.split`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.symbol.split.js), [`es.symbol.to-primitive`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.symbol.to-primitive.js), [`es.symbol.to-string-tag`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.symbol.to-string-tag.js), [`es.symbol.unscopables`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.symbol.unscopables.js), [`es.math.to-string-tag`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.math.to-string-tag.js).
```js
class Symbol {
  constructor(description?): symbol;
  readonly attribute description: string | void;
  static asyncIterator: @@asyncIterator;
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
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/symbol
core-js(-pure)/es|stable|actual|full/symbol/async-iterator
core-js/es|stable|actual|full/symbol/description
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
core-js(-pure)/es|stable|actual|full/math/to-string-tag
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

[*Symbol#description getter*](https://goo.gl/MWizfc):
```js
Symbol('foo').description; // => 'foo'
Symbol().description;      // => undefined
```
##### Caveats when using `Symbol` polyfill:[⬆](#index)

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

#### ECMAScript: Collections[⬆](#index)
`core-js` uses native collections in most case, just fixes methods / constructor, if it's required, and in old environment uses fast polyfill (O(1) lookup).
#### Map[⬆](#index)
Module [`es.map`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.map.js).
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
#### Set[⬆](#index)
Module [`es.set`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.set.js).
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
#### WeakMap[⬆](#index)
Module [`es.weak-map`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.weak-map.js).
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
#### WeakSet[⬆](#index)
Module [`es.weak-set`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.weak-set.js).
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
##### Caveats when using collections polyfill:[⬆](#index)

* Weak-collections polyfill stores values as hidden properties of keys. It works correct and not leak in most cases. However, it is desirable to store a collection longer than its keys.

#### ECMAScript: Typed Arrays[⬆](#index)
Implementations and fixes for `ArrayBuffer`, `DataView`, Typed Arrays constructors, static and prototype methods.

Modules [`es.array-buffer.constructor`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array-buffer.constructor.js), [`es.array-buffer.is-view`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array-buffer.is-view.js), [`es.array-buffer.slice`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.array-buffer.slice.js), [`es.data-view`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.data-view.js), [`es.typed-array.int8-array`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.int8-array.js), [`es.typed-array.uint8-array`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.uint8-array.js), [`es.typed-array.uint8-clamped-array`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.uint8-clamped-array.js), [`es.typed-array.int16-array`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.int16-array.js), [`es.typed-array.uint16-array`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.uint16-array.js), [`es.typed-array.int32-array`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed.int32-array.js), [`es.typed-array.uint32-array`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.uint32-array.js), [`es.typed-array.float32-array`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.float32-array.js), [`es.typed-array.float64-array`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.float64-array.js), [`es.typed-array.copy-within`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.copy-within.js), [`es.typed-array.every`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.every.js), [`es.typed-array.fill`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.fill.js), [`es.typed-array.filter`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.filter.js), [`es.typed-array.find`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.find.js), [`es.typed-array.find-index`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.find-index.js), [`es.typed-array.for-each`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.for-each.js), [`es.typed-array.from`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.from.js), [`es.typed-array.includes`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.includes.js), [`es.typed-array.index-of`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.index-of.js), [`es.typed-array.iterator`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.iterator.js), [`es.typed-array.last-index-of`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.last-index-of.js), [`es.typed-array.map`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.map.js), [`es.typed-array.of`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.of.js), [`es.typed-array.reduce`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.reduce.js), [`es.typed-array.reduce-right`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.reduce-right.js), [`es.typed-array.reverse`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.reverse.js), [`es.typed-array.set`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.set.js), [`es.typed-array.slice`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.slice.js), [`es.typed-array.some`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.some.js), [`es.typed-array.sort`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.sort.js), [`es.typed-array.subarray`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.subarray.js), [`es.typed-array.to-locale-string`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.to-locale-string.js) and [`es.typed-array.to-string`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.typed-array.to-string.js).
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
  copyWithin(target: number, start: number, end?: number): this;
  every(callbackfn: (value: number, index: number, target: %TypedArray%) => boolean, thisArg?: any): boolean;
  fill(value: number, start?: number, end?: number): this;
  filter(callbackfn: (value: number, index: number, target: %TypedArray%) => boolean, thisArg?: any): %TypedArray%;
  find(callbackfn: (value: number, index: number, target: %TypedArray%) => boolean), thisArg?: any): any;
  findIndex(callbackfn: (value: number, index: number, target: %TypedArray%) => boolean, thisArg?: any): number;
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
  sort(comparefn?: (a: number, b: number) => number): this;
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
core-js/es|stable|actual|full/typed-array/copy-within
core-js/es|stable|actual|full/typed-array/entries
core-js/es|stable|actual|full/typed-array/every
core-js/es|stable|actual|full/typed-array/fill
core-js/es|stable|actual|full/typed-array/filter
core-js/es|stable|actual|full/typed-array/find
core-js/es|stable|actual|full/typed-array/find-index
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
##### Caveats when using typed arrays polyfills:[⬆](#index)

* Polyfills of Typed Arrays constructors work completely how should work by the spec, but because of internal usage of getters / setters on each instance, are slow and consumes significant memory. However, polyfills of Typed Arrays constructors required mainly for old IE, all modern engines have native Typed Arrays constructors and require only fixes of constructors and polyfills of methods.

#### ECMAScript: Reflect[⬆](#index)
Modules [`es.reflect.apply`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.reflect.apply.js), [`es.reflect.construct`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.reflect.construct.js), [`es.reflect.define-property`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.reflect.define-property.js), [`es.reflect.delete-property`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.reflect.delete-property.js), [`es.reflect.get`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.reflect.get.js), [`es.reflect.get-own-property-descriptor`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.reflect.get-own-property-descriptor.js), [`es.reflect.get-prototype-of`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.reflect.get-prototype-of.js), [`es.reflect.has`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.reflect.has.js), [`es.reflect.is-extensible`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.reflect.is-extensible.js), [`es.reflect.own-keys`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.reflect.own-keys.js), [`es.reflect.prevent-extensions`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.reflect.prevent-extensions.js), [`es.reflect.set`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.reflect.set.js), [`es.reflect.set-prototype-of`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.reflect.set-prototype-of.js).
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

#### ECMAScript: JSON[⬆](#index)
Since `JSON` object is missed only in very old engines like IE7-, `core-js` does not provide a full `JSON` polyfill, however, fix already existing implementations by the current standard, for example, [well-formed `JSON.stringify`](https://github.com/tc39/proposal-well-formed-stringify). `JSON` also fixed in other modules - for example, `Symbol` polyfill fixes `JSON.stringify` for correct work with symbols.

Module [`es.json.to-string-tag`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.json.to-string-tag.js) and [`es.json.stringify`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.json.stringify.js).
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
[*Examples*](http://es6.zloirock.ru/#log(JSON.stringify(%7B%20'%F0%A0%AE%B7'%3A%20%5B'%5CuDF06%5CuD834'%5D%20%7D))%3B%20%2F%2F%20%3D%3E%20'%7B%22%F0%A0%AE%B7%22%3A%5B%22%5C%5Cudf06%5C%5Cud834%22%5D%7D'):
```js
JSON.stringify({ '𠮷': ['\uDF06\uD834'] }); // => '{"𠮷":["\\udf06\\ud834"]}'
```

#### ECMAScript: globalThis[⬆](#index)
Module [`es.global-this`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/es.global-this.js).
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
`core-js/stage/4` entry point contains only stage 4 proposals, `core-js/stage/3` - stage 3 and stage 4, etc.
#### Stage 4 proposals[⬆](#index)

Stage 4 proposals already marked in `core-js` as stable ECMAScript, they will be removed from proposals namespace in the next major `core-js` version.
[*CommonJS entry points:*](#commonjs-api)
```js
core-js(-pure)/stage/4
```

None.

#### Stage 3 proposals[⬆](#index)
[*CommonJS entry points:*](#commonjs-api)
```js
core-js(-pure)/stage/3
```

##### [Relative indexing method](https://github.com/tc39/proposal-relative-indexing-method)[⬆](#index)
Modules [`esnext.array.at`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.array.at.js), [`esnext.string.at`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.string.at.js) and [`esnext.typed-array.at`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.typed-array.at.js)

```js
class Array {
  at(index: int): any;
}

class String {
  at(index: int): string | undefined;
}

class %TypedArray% {
  at(index: int): any;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/relative-indexing-method
core-js(-pure)/actual|full/array/at
core-js(-pure)/actual|full/string/at
core-js(-pure)/actual|full/typed-array/at
```
[*Examples*](http://es6.zloirock.ru/#log(%5B1%2C%202%2C%203%5D.at(1))%3B%20%20%2F%2F%20%3D%3E%202%0Alog(%5B1%2C%202%2C%203%5D.at(-1))%3B%20%2F%2F%20%3D%3E%203):
```js
[1, 2, 3].at(1);  // => 2
[1, 2, 3].at(-1); // => 3

'123'.at(-1);     // => '3'
```

#### Stage 2 proposals[⬆](#index)
[*CommonJS entry points:*](#commonjs-api)
```
core-js(-pure)/stage/2
```
##### [New `Set` methods](https://github.com/tc39/proposal-set-methods)[⬆](#index)
Modules [`esnext.set.difference`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.set.difference.js), [`esnext.set.intersection`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.set.intersection.js), [`esnext.set.is-disjoint-from`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.set.is-disjoint-from.js), [`esnext.set.is-subset-of`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.set.is-subset-of.js), [`esnext.set.is-superset-of`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.set.is-superset-of.js), [`esnext.set.symmetric-difference`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.set.symmetric-difference.js), [`esnext.set.union`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.set.union.js)
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
##### [`Symbol.{ asyncDispose, dispose }` for `using` statement](https://github.com/tc39/proposal-using-statement)[⬆](#index)
Modules [`esnext.symbol.dispose`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.symbol.dispose.js) and [`esnext.symbol.async-dispose`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.symbol.async-dispose.js).
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
##### [`Array.isTemplateObject`](https://github.com/tc39/proposal-array-is-template-object)[⬆](#index)
Module [`esnext.array.is-template-object`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.array.is-template-object.js)
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
##### [Iterator helpers](https://github.com/tc39/proposal-iterator-helpers)[⬆](#index)
Modules [`esnext.async-iterator.constructor`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.async-iterator.constructor.js), [`esnext.async-iterator.as-indexed-pairs`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.async-iterator.as-indexed-pairs.js), [`esnext.async-iterator.drop`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.async-iterator.drop.js), [`esnext.async-iterator.every`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.async-iterator.every.js), [`esnext.async-iterator.filter`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.async-iterator.filter.js), [`esnext.async-iterator.find`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.async-iterator.find.js), [`esnext.async-iterator.flat-map`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.async-iterator.flat-map.js), [`esnext.async-iterator.for-each`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.async-iterator.for-each.js), [`esnext.async-iterator.from`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.async-iterator.from.js), [`esnext.async-iterator.map`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.async-iterator.map.js), [`esnext.async-iterator.reduce`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.async-iterator.reduce.js), [`esnext.async-iterator.some`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.async-iterator.some.js), [`esnext.async-iterator.take`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.async-iterator.take.js), [`esnext.async-iterator.to-array`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.async-iterator.to-array.js), [`esnext.iterator.constructor`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.iterator.constructor.js), [`esnext.iterator.as-indexed-pairs`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.iterator.as-indexed-pairs.js), [`esnext.iterator.drop`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.iterator.drop.js), [`esnext.iterator.every`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.iterator.every.js), [`esnext.iterator.filter`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.iterator.filter.js), [`esnext.iterator.find`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.iterator.find.js), [`esnext.iterator.flat-map`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.iterator.flat-map.js), [`esnext.iterator.for-each`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.iterator.for-each.js), [`esnext.iterator.from`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.iterator.from.js), [`esnext.iterator.map`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.iterator.map.js), [`esnext.iterator.reduce`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.iterator.reduce.js), [`esnext.iterator.some`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.iterator.some.js), [`esnext.iterator.take`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.iterator.take.js) and [`esnext.iterator.to-array`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.iterator.to-array.js)
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
```
[Examples](http://es6.zloirock.ru/#log(%5B1%2C%202%2C%203%2C%204%2C%205%2C%206%2C%207%5D.values()%0A%20%20.drop(1)%0A%20%20.take(5)%0A%20%20.filter(it%20%3D%3E%20it%20%25%202)%0A%20%20.map(it%20%3D%3E%20it%20**%202)%0A%20%20.toArray())%3B%20%2F%2F%20%3D%3E%20%5B9%2C%2025%5D%0A%0Alog(Iterator.from(%7B%0A%20%20next%3A%20()%20%3D%3E%20(%7B%20done%3A%20Math.random()%20%3E%20.9%2C%20value%3A%20Math.random()%20*%2010%20%7C%200%20%7D)%0A%7D).toArray())%3B%20%2F%2F%20%3D%3E%20%5B7%2C%206%2C%203%2C%200%2C%202%2C%208%5D%0A%0AAsyncIterator.from(%5B1%2C%202%2C%203%2C%204%2C%205%2C%206%2C%207%5D)%0A%20%20.drop(1)%0A%20%20.take(5)%0A%20%20.filter(it%20%3D%3E%20it%20%25%202)%0A%20%20.map(it%20%3D%3E%20it%20**%202)%0A%20%20.toArray()%0A%20%20.then(log)%3B%20%2F%2F%20%3D%3E%20%5B9%2C%2025%5D):
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

AsyncIterator.from([1, 2, 3, 4, 5, 6, 7])
  .drop(1)
  .take(5)
  .filter(it => it % 2)
  .map(it => it ** 2)
  .toArray()
  .then(console.log); // => [9, 25]
```
###### Caveats:[⬆](#index)
- For preventing prototypes pollution, in the `pure` version, new `%IteratorPrototype%` methods are not added to the real `%IteratorPrototype%`, they available only on wrappers - instead of `[].values().map(fn)` use `Iterator.from([]).map(fn)`.
- Now, we have access to the real `%AsyncIteratorPrototype%` only with usage async generators syntax. So, for compatibility the library with old browsers, we should use `Function` constructor. However, that breaks compatibility with CSP. So, if you wanna use the real `%AsyncIteratorPrototype%`, you should set `USE_FUNCTION_CONSTRUCTOR` option in the `core-js/configurator` to `true`:
```js
const configurator = require('core-js/configurator');

configurator({ USE_FUNCTION_CONSTRUCTOR: true });

require('core-js');

(async function * () { /* empty */ })() instanceof AsyncIterator; // => true
```
##### [`Map#emplace`](https://github.com/thumbsupep/proposal-upsert)[⬆](#index)
Modules [`esnext.map.emplace`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.map.emplace.js) and [`esnext.weak-map.emplace`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.weak-map.emplace.js)
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
core-js/proposals/map-upsert
core-js(-pure)/full/map/emplace
core-js(-pure)/full/weak-map/emplace
```
[*Examples*](http://es6.zloirock.ru/#const%20map%20%3D%20new%20Map(%5B%5B'a'%2C%202%5D%5D)%3B%0A%0Amap.emplace('a'%2C%20%7B%20update%3A%20it%20%3D%3E%20it%20**%202%2C%20insert%3A%20()%20%3D%3E%203%7D)%3B%20%2F%2F%20%3D%3E%204%0A%0Amap.emplace('b'%2C%20%7B%20update%3A%20it%20%3D%3E%20it%20**%202%2C%20insert%3A%20()%20%3D%3E%203%7D)%3B%20%2F%2F%20%3D%3E%203%0A%0Afor%20(let%20%5Bkey%2C%20value%5D%20of%20map)%7B%0A%20%20log(key%2C%20value)%3B%20%2F%2F%20%3D%3E%20Map%20%7B%20'a'%3A%204%2C%20'b'%3A%203%20%7D%0A%7D):
```js
const map = new Map([['a', 2]]);

map.emplace('a', { update: it => it ** 2, insert: () => 3}); // => 4

map.emplace('b', { update: it => it ** 2, insert: () => 3}); // => 3

console.log(map); // => Map { 'a': 4, 'b': 3 }
```
##### [Array find from last](https://github.com/tc39/proposal-array-find-from-last)[⬆](#index)
Modules [`esnext.array.find-last`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.array.find-last.js), [`esnext.array.find-last-index`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.array.find-last-index.js), [`esnext.typed-array.find-last`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.typed-array.find-last.js) and [`esnext.typed-array.find-last-index`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.typed-array.find-last-index.js).
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
core-js(-pure)/features(/virtual)/array/find-last
core-js(-pure)/features(/virtual)/array/find-last-index
core-js/features/typed-array/find-last
core-js/features/typed-array/find-last-index
```
[*Examples*](http://es6.zloirock.ru/#log(%5B1%2C%202%2C%203%2C%204%5D.findLast(it%20%3D%3E%20it%20%25%202))%3B%20%20%20%20%20%20%2F%2F%20%3D%3E%203%0Alog(%5B1%2C%202%2C%203%2C%204%5D.findLastIndex(it%20%3D%3E%20it%20%25%202))%3B%20%2F%2F%20%3D%3E%202):
```js
[1, 2, 3, 4].findLast(it => it % 2);      // => 3
[1, 2, 3, 4].findLastIndex(it => it % 2); // => 2
````
##### [Array find from last](https://github.com/tc39/proposal-array-find-from-last)[⬆](#index)
Modules [`esnext.array.find-last`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.array.find-last.js), [`esnext.array.find-last-index`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.array.find-last-index.js), [`esnext.typed-array.find-last`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.typed-array.find-last.js) and [`esnext.typed-array.find-last-index`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.typed-array.find-last-index.js).
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
core-js(-pure)/full(/virtual)/array/find-last
core-js(-pure)/full(/virtual)/array/find-last-index
core-js/full/typed-array/find-last
core-js/full/typed-array/find-last-index
```
[*Examples*](http://es6.zloirock.ru/#log(%5B1%2C%202%2C%203%2C%204%5D.findLast(it%20%3D%3E%20it%20%25%202))%3B%20%20%20%20%20%20%2F%2F%20%3D%3E%203%0Alog(%5B1%2C%202%2C%203%2C%204%5D.findLastIndex(it%20%3D%3E%20it%20%25%202))%3B%20%2F%2F%20%3D%3E%202):
```js
[1, 2, 3, 4].findLast(it => it % 2);      // => 3
[1, 2, 3, 4].findLastIndex(it => it % 2); // => 2
````

#### Stage 1 proposals[⬆](#index)
[*CommonJS entry points:*](#commonjs-api)
```js
core-js(-pure)/stage/1
```
##### [Getting last item from `Array`](https://github.com/keithamus/proposal-array-last)[⬆](#index)
Modules [`esnext.array.last-item`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.array.last-item.js) and [`esnext.array.last-index`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.array.last-index.js)
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
##### [`Promise.try`](https://github.com/tc39/proposal-promise-try)[⬆](#index)
Module [`esnext.promise.try`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.promise.try.js)
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
#### New collections methods:[⬆](#index)
##### [New `Set` and `Map` methods](https://github.com/tc39/proposal-collection-methods)[⬆](#index)
Modules [`esnext.set.add-all`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.set.add-all.js), [`esnext.set.delete-all`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.set.delete-all.js), [`esnext.set.every`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.set.every.js), [`esnext.set.filter`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.set.filter.js), [`esnext.set.find`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.set.find.js), [`esnext.set.join`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.set.join.js), [`esnext.set.map`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.set.map.js), [`esnext.set.reduce`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.set.reduce.js), [`esnext.set.some`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.set.some.js), [`esnext.map.delete-all`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.map.delete-all.js), [`esnext.map.every`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.map.every.js), [`esnext.map.filter`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.map.filter.js), [`esnext.map.find`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.map.find.js), [`esnext.map.find-key`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.map.find-key.js), [`esnext.map.group-by`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.map.group-by.js), [`esnext.map.includes`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.map.includes.js), [`esnext.map.key-by`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.map.key-by.js), [`esnext.map.key-of`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.map.key-of.js), [`esnext.map.map-keys`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.map.map-keys.js), [`esnext.map.map-values`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.map.map-values.js), [`esnext.map.merge`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.map.merge.js), [`esnext.map.reduce`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.map.reduce.js), [`esnext.map.some`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.map.some.js), [`esnext.map.update`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.map.update.js), [`esnext.weak-set.add-all`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.weak-set.add-all.js), [`esnext.weak-set.delete-all`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.weak-set.delete-all.js), [`esnext.weak-map.delete-all`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.weak-map.delete-all.js)
##### [`.of` and `.from` methods on collection constructors](https://github.com/tc39/proposal-setmap-offrom)[⬆](#index)
Modules [`esnext.set.of`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.set.of.js), [`esnext.set.from`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.set.from.js), [`esnext.map.of`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.map.of.js), [`esnext.map.from`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.map.from.js), [`esnext.weak-set.of`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.weak-set.of.js), [`esnext.weak-set.from`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.weak-set.from.js), [`esnext.weak-map.of`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.weak-map.of.js), [`esnext.weak-map.from`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.weak-map.from.js)
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
##### [`compositeKey` and `compositeSymbol` methods](https://github.com/tc39/proposal-richer-keys/tree/master/compositeKey)[⬆](#index)
Modules [`esnext.composite-key`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.composite-key.js) and [`esnext.composite-symbol`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.composite-symbol.js)
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
##### [`Observable`](https://github.com/zenparsing/es-observable)[⬆](#index)
Modules [`esnext.observable`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.observable.js) and [`esnext.symbol.observable`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.symbol.observable.js)
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
##### [`Math` extensions](https://github.com/rwaldron/proposal-math-extensions)[⬆](#index)
Modules [`esnext.math.clamp`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.math.clamp.js), [`esnext.math.deg-per-rad`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.math.deg-per-rad.js), [`esnext.math.degrees`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.math.degrees.js), [`esnext.math.fscale`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.math.fscale.js), [`esnext.math.rad-per-deg`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.math.rad-per-deg.js), [`esnext.math.radians`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.math.radians.js) and [`esnext.math.scale`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.math.scale.js)
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
Module [`esnext.math.signbit`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.math.signbit.js)
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
##### [`Number.fromString`](https://github.com/tc39/proposal-number-fromstring)[⬆](#index)
Module [`esnext.number.from-string`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.number.from-string.js)
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
##### [`Number.range`](https://github.com/tc39/proposal-Number.range)[⬆](#index)
Module [`esnext.number.range`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.number.range.js) and [`esnext.bigint.range`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.bigint.range.js)
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
[*Example*](http://es6.zloirock.ru/#for%20(const%20i%20of%20Number.range(1%2C%2010%2C%20%7B%20step%3A%203%2C%20inclusive%3A%20true%20%7D))%20%7B%0A%20%20log(i)%3B%20%2F%2F%20%3D%3E%201%2C%204%2C%207%2C%2010%0A%7D):
```js
for (const i of Number.range(1, 10)) {
  console.log(i); // => 1, 2, 3, 4, 5, 6, 7, 8, 9
}

for (const i of Number.range(1, 10, { step: 3, inclusive: true })) {
  console.log(i); // => 1, 4, 7, 10
}
```
##### [`String#codePoints`](https://github.com/tc39/proposal-string-prototype-codepoints)[⬆](#index)
Module [`esnext.string.code-points`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.string.code-points.js)
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
##### [Array filtering](https://github.com/tc39/proposal-array-filtering)[⬆](#index)
Modules [`esnext.array.filter-out`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.array.filter-out.js) and [`esnext.typed-array.filter-out`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.typed-array.filter-out.js).
```js
class Array {
  filterOut(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): Array<mixed>;
}

class %TypedArray% {
  filterOut(callbackfn: (value: number, index: number, target: %TypedArray%) => boolean, thisArg?: any): %TypedArray%;
}
```
[*CommonJS entry points:*](#commonjs-api)
```
core-js/proposals/array-filtering
core-js(-pure)/full/array(/virtual)/filter-out
core-js/full/typed-array/filter-out
```
[*Examples*](http://es6.zloirock.ru/#log(%5B1%2C%202%2C%203%2C%204%2C%205%5D.filterOut(it%20%3D%3E%20it%20%25%202))%3B%20%2F%2F%20%3D%3E%20%5B2%2C%204%5D):
```js
[1, 2, 3, 4, 5].filterOut(it => it % 2); // => [2, 4]
````
##### [Array deduplication](https://github.com/tc39/proposal-array-unique)[⬆](#index)
Modules [`esnext.array.unique-by`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.array.unique-by.js) and [`esnext.typed-array.unique-by`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.typed-array.unique-by.js)
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
[*Examples*](http://es6.zloirock.ru/#log(%5B1%2C%202%2C%203%2C%202%2C%201%5D.uniqueBy())%3B%20%20%2F%2F%20%5B1%2C%202%2C%203%5D%0A%0Aconst%20data%20%3D%20%5B%0A%20%20%7B%20id%3A%201%2C%20uid%3A%2010000%20%7D%2C%0A%20%20%7B%20id%3A%202%2C%20uid%3A%2010000%20%7D%2C%0A%20%20%7B%20id%3A%203%2C%20uid%3A%2010001%20%7D%0A%5D%3B%0A%0Alog(data.uniqueBy('uid'))%3B%20%2F%2F%20%3D%3E%20%5B%7B%20id%3A%201%2C%20uid%3A%2010000%20%7D%2C%20%7B%20id%3A%203%2C%20uid%3A%2010001%20%7D%5D%0A%0Alog(data.uniqueBy((%7B%20id%2C%20uid%20%7D)%20%3D%3E%20%60%24%7Bid%7D-%24%7Buid%7D%60))%3B%20%2F%2F%20%3D%3E%20%5B%7B%20id%3A%201%2C%20uid%3A%2010000%20%7D%2C%20%7B%20id%3A%202%2C%20uid%3A%2010000%20%7D%2C%20%7B%20id%3A%203%2C%20uid%3A%2010001%20%7D%5D):
```js
[1, 2, 3, 2, 1].uniqueBy(); // [1, 2, 3]

[
  { id: 1, uid: 10000 },
  { id: 2, uid: 10000 },
  { id: 3, uid: 10001 }
].uniqueBy(it => it.id);    // => [{ id: 1, uid: 10000 }, { id: 3, uid: 10001 }]
```

#### Stage 0 proposals[⬆](#index)
[*CommonJS entry points:*](#commonjs-api)
```js
core-js(-pure)/stage/0
```
##### [`URL`](https://github.com/jasnell/proposal-url)[⬆](#index)
See more info [in web standards namespace](#url-and-urlsearchparams)

#### Pre-stage 0 proposals[⬆](#index)
[*CommonJS entry points:*](#commonjs-api)
```js
core-js(-pure)/stage/pre
```
##### [`Reflect` metadata](https://github.com/rbuckton/reflect-metadata)[⬆](#index)
Modules [`esnext.reflect.define-metadata`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.reflect.define-metadata.js), [`esnext.reflect.delete-metadata`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.reflect.delete-metadata.js), [`esnext.reflect.get-metadata`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.reflect.get-metadata.js), [`esnext.reflect.get-metadata-keys`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.reflect.get-metadata-keys.js), [`esnext.reflect.get-own-metadata`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.reflect.get-own-metadata.js), [`esnext.reflect.get-own-metadata-keys`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.reflect.get-own-metadata-keys.js), [`esnext.reflect.has-metadata`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.reflect.has-metadata.js), [`esnext.reflect.has-own-metadata`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.reflect.has-own-metadata.js) and [`esnext.reflect.metadata`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/esnext.reflect.metadata.js).
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
[*Examples*](http://goo.gl/KCo3PS):
```js
let object = {};
Reflect.defineMetadata('foo', 'bar', object);
Reflect.ownKeys(object);               // => []
Reflect.getOwnMetadataKeys(object);    // => ['foo']
Reflect.getOwnMetadata('foo', object); // => 'bar'
```

### Web standards[⬆](#index)
[*CommonJS entry points:*](#commonjs-api)
```js
core-js(-pure)/web
```
#### `setTimeout` and `setInterval`[⬆](#index)
Modules [`web.set-interval`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/web.set-interval.js) and [`web.set-timeout`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/web.set-timeout.js). Additional arguments fix for IE9-.
```js
function setTimeout(callback: any, time: any, ...args: Array<mixed>): number;
function setInterval(callback: any, time: any, ...args: Array<mixed>): number;
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js(-pure)/web/set-interval
core-js(-pure)/web/set-timeout
core-js(-pure)/stable|actual|full/set-interval
core-js(-pure)/stable|actual|full/set-timeout
```
```js
// Before:
setTimeout(log.bind(null, 42), 1000);
// After:
setTimeout(log, 1000, 42);
```
#### `setImmediate`[⬆](#index)
Modules [`web.clear-immediate`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/web.clear-immediate.js) and [`web.set-immediate`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/web.set-immediate.js). [`setImmediate`](http://w3c.github.io/setImmediate/) polyfill.
```js
function setImmediate(callback: any, ...args: Array<mixed>): number;
function clearImmediate(id: number): void;
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js(-pure)/stable|actual|full|web/set-immediate
core-js(-pure)/stable|actual|full|web/clear-immediate
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

#### `queueMicrotask`[⬆](#index)
[Spec](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-queuemicrotask), module [`web.queue-microtask`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/web.queue-microtask.js)
```js
function queueMicrotask(fn: Function): void;
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/web/queue-microtask
core-js(-pure)/stable|actual|full/queue-microtask
```
[*Examples*](https://goo.gl/nsW8P9):
```js
queueMicrotask(() => console.log('called as microtask'));
```

#### `URL` and `URLSearchParams`[⬆](#index)
[`URL` standard](https://url.spec.whatwg.org/) implementation. Modules [`web.url`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/web.url.js), [`web.url.to-json`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/web.url.to-json.js), [`web.url-search-params`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/web.url-search-params.js).
```js
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
}

class URLSearchParams {
  constructor(params?: string | Iterable<[key, value]> | Object);
  append(name: string, value: string): void;
  delete(name: string): void;
  get(name: string): string | void;
  getAll(name: string): Array<string>;
  has(name: string): boolean;
  set(name: string, value: string): void;
  sort(): void;
  toString(): string;
  forEach(callbackfn: (value: any, index: number, target: any) => void, thisArg: any): void;
  entries(): Iterator<[key, value]>;
  keys(): Iterator<key>;
  values(): Iterator<value>;
  @@iterator(): Iterator<[key, value]>;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/url
core-js(-pure)/stable|actual|full|web/url
core-js/stable|actual|full|web/url/to-json
core-js(-pure)/stable|actual|full|web/url-search-params
```
[*Examples*](https://goo.gl/kksjwV):
```js
const url = new URL('http://login:password@example.com:8080/foo/bar?a=1&b=2&a=3#fragment');

console.log(url.href);       // => 'http://login:password@example.com:8080/foo/bar?a=1&b=2#fragment'
console.log(url.origin);     // => 'http://example.com:8080'
console.log(url.protocol);   // => 'http:'
console.log(url.username);   // => 'login'
console.log(url.password);   // => 'password'
console.log(url.host);       // => 'example.com:8080'
console.log(url.hostname);   // => 'example.com'
console.log(url.port);       // => '8080'
console.log(url.pathname);   // => '/foo/bar'
console.log(url.search);     // => '?a=1&b=2&a=3'
console.log(url.hash);       // => '#fragment'
console.log(url.toJSON());   // => 'http://login:password@example.com:8080/foo/bar?a=1&b=2&a=3#fragment'
console.log(url.toString()); // => 'http://login:password@example.com:8080/foo/bar?a=1&b=2&a=3#fragment'

for (let [key, value] of url.searchParams) {
  console.log(key);   // => 'a', 'b'
  console.log(value); // => '1', '2'
}

url.pathname = '';
url.searchParams.append('c', 3);

console.log(url.search); // => '?a=1&b=2&c=3'
console.log(url.href);   // => 'http://login:password@example.com:8080/?a=1&a=3&b=2&c=4#fragment'

const params = new URLSearchParams('?a=1&b=2&a=3');

params.append('c', 4);
params.append('a', 2);
params.sort();

for (let [key, value] of params) {
  console.log(key);   // => 'a', 'a', 'a', 'b', 'c'
  console.log(value); // => '1', '3', '2', '2', '4'
}

console.log(params.toString()); // => 'a=1&a=3&a=2&b=2&c=4'
```

##### Caveats when using `URL` and `URLSearchParams`:[⬆](#index)
- Legacy encodings in a search query are not supported. Also, `core-js` implementation has some other encoding-related issues.
- `URL` implementations from all of the popular browsers have much more problems than `core-js`, however, replacing all of them does not looks like a good idea. You can customize the aggressiveness of polyfill [by your requirements](#configurable-level-of-aggressiveness).

#### Iterable DOM collections[⬆](#index)
Some DOM collections should have [iterable interface](https://heycam.github.io/webidl/#idl-iterable) or should be [inherited from `Array`](https://heycam.github.io/webidl/#LegacyArrayClass). That means they should have `forEach`, `keys`, `values`, `entries` and `@@iterator` methods for iteration. So add them. Modules [`web.dom-collections.iterator`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/web.dom-collections.iterator.js) and [`web.dom-collections.for-each`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/web.dom-collections.for-each.js).
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
  forEach(callbackfn: (value: any, index: number, target: any) => void, thisArg: any): void;
  entries(): Iterator<[key, value]>;
  keys(): Iterator<key>;
  values(): Iterator<value>;
  @@iterator(): Iterator<value>;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js(-pure)/stable|full|web/dom-collections
core-js(-pure)/stable|full|web/dom-collections/iterator
core-js(-pure)/stable|full|web/dom-collections/for-each
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
### Iteration helpers[⬆](#index)
Modules [`core.is-iterable`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/core.is-iterable.js), [`core.get-iterator`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/core.get-iterator.js), [`core.get-iterator-method`](https://github.com/zloirock/core-js/blob/v3.9.1/packages/core-js/modules/core.get-iterator-method.js) - helpers for check iterability / get iterator in the `pure` version or, for example, for `arguments` object:
```js
function isIterable(value: any): boolean;
function getIterator(value: any): Object;
function getIteratorMethod(value: any): Function | void;
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js-pure/full/is-iterable
core-js-pure/full/get-iterator
core-js-pure/full/get-iterator-method
```
[*Examples*](http://goo.gl/SXsM6D):
```js
import isIterable from 'core-js-pure/full/is-iterable';
import getIterator from 'core-js-pure/full/get-iterator';
import getIteratorMethod from 'core-js-pure/full/get-iterator-method';

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

## Missing polyfills[⬆](#index)
- ES `String#normalize` is not a very useful feature, but this polyfill will be very large. If you need it, you can use [unorm](https://github.com/walling/unorm/).
- ES `Proxy` can't be polyfilled, you can try [`proxy-polyfill`](https://github.com/GoogleChrome/proxy-polyfill) which provides a very little subset of features.
- `window.fetch` is not a cross-platform feature, in some environments, it makes no sense. For this reason, I don't think it should be in `core-js`. Looking at a large number of requests it *might be*  added in the future. Now you can use, for example, [this polyfill](https://github.com/github/fetch).
- ECMA-402 `Intl` is missed because of the size. You can use [this polyfill](https://github.com/andyearnshaw/Intl.js/).
