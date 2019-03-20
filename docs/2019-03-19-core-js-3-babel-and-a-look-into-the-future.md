# core-js@3, babel and a look into the future

After more than 1.5 years of development, dozens of pre-releases, many sleepless nights, **[`core-js@3`](https://github.com/zloirock/core-js)** is finally released. It's the largest set of changes in `core-js` and polyfilling-related **[`babel`](https://babeljs.io)** features of all time.

What is `core-js`?
- It is a polyfill of the JavaScript standard library, which supports:
  - The latest ECMAScript standard.
  - ECMAScript standard library proposals.
  - Some WHATWG / W3C standards (cross-platform or closely related ECMAScript).
- It is maximally modular: you can easily choose to load only the features you will be using.
- It can be used without polluting the global namespace.
- It is [tightly integrated with `babel`](#Babel): this allows many optimizations of `core-js` import.

It's the most universal and [the most popular](https://www.npmtrends.com/core-js-vs-es5-shim-vs-es6-shim-vs-airbnb-js-shims-vs-polyfill-library-vs-polyfill-service-vs-js-polyfills) way to polyfill JavaScript standard library, but a big part of developers just don't know that they use `core-js` indirectly 🙂

## Contributing

`core-js` is my own hobby project and it does not bring me any profit. It takes too much time and it is really costly: to finish work on `core-js@3`, I had left my job some months ago. This project facilitates the life of many people and companies. For these reasons, it makes sense to start raising funds to support the maintenance of `core-js`.

If you interested in the `core-js` project or use it in your day-to-day work, you can become a sponsor on **[Open Collective](https://opencollective.com/core-js#sponsor)** or **[Patreon](https://www.patreon.com/zloirock)**.

You can propose [me](http://zloirock.ru/) a good job where I will be able to work on something related.

Or you can contribute in another way: you can help improving code, tests or documentation (currently, `core-js` documentation is terrible!).

## What changed in `core-js@3`?

### Changes in JavaScript standard library content

Because of the following two reasons, this release is rich with new JavaScript polyfills:
- `core-js` only has breaking changes in major releases, even if it is needed to reflect a change in a proposal.
- `core-js@2` entered feature freeze 1.5 years ago; all new features were added only to the `core-js@3` branch.

#### Stable ECMAScript features

Stable ECMAScript features had already been almost completely supported by `core-js` for a long time, however, `core-js@3` introduced some new features:
- Added support of [`@@isConcatSpreadable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/isConcatSpreadable) and [`@@species`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/species) well-known symbols, introduced in ECMAScript 2015, to all the methods which use them.
- Added [`Array.prototype.flat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat) and [`Array.prototype.flatMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap) methods from ECMAScript 2018 (`core-js@2` provided a polyfill for an old version of this proposal with `Array.prototype.flatten`).
- Added [`Object.fromEntries`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries) method, introduced in ECMAScript 2019.
- Added [`Symbol.prototype.description`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/description) accessor, introduced ECMAScript 2019.

Some features that have already been available for a long time as proposals have been accepted in ES2016-ES2019 and are now marked as stable:
- [`Array.prototype.includes`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes) and [`%TypedArray%.prototype.includes`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/includes) methods (ECMAScript 2016)
- [`Object.values`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values) and [`Object.entries`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries) methods (ECMAScript 2017)
- [`Object.getOwnPropertyDescriptors`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptors) method (ECMAScript 2017)
- [`String.prototype.padStart`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart) and [`String.prototype.padEnd`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padEnd) methods (ECMAScript 2017)
- [`Promise.prototype.finally`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally) method (ECMAScript 2018)
- [`Symbol.asyncIterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator) well-known symbol (ECMAScript 2018)
- [`Object.prototype.__define(Getter|Setter)__`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/__defineGetter__) and [`Object.prototype.__lookup(Getter|Setter)__`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/__lookupGetter__) methods (ECMAScript 2018)
- [`String.prototype.trim(Start|End|Left|Right)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trimStart) methods (ECMAScript 2019)

Added many fixes for browsers bugs/issues. For example, [Safari 12.0 `Array.prototype.reverse` bug](https://bugs.webkit.org/show_bug.cgi?id=188794) has been fixed.

#### ECMAScript proposals

In addition to supported before, `core-js@3` now supports the following ECMAScript proposals:
- [`globalThis`](https://github.com/tc39/proposal-global) stage 3 proposal - before, we had `global` and `System.global`
- [`Promise.allSettled`](https://github.com/tc39/proposal-promise-allSettled) stage 2 proposal
- [New `Set` methods](https://github.com/tc39/proposal-set-methods) stage 2 proposal:
  - `Set.prototype.difference`
  - `Set.prototype.intersection`
  - `Set.prototype.isDisjointFrom`
  - `Set.prototype.isSubsetOf`
  - `Set.prototype.isSupersetOf`
  - `Set.prototype.symmetricDifference`
  - `Set.prototype.union`
- [New collections methods](https://github.com/tc39/proposal-collection-methods) stage 1 proposal, which includes many new useful methods:
  - `Map.groupBy`
  - `Map.keyBy`
  - `Map.prototype.deleteAll`
  - `Map.prototype.every`
  - `Map.prototype.filter`
  - `Map.prototype.find`
  - `Map.prototype.findKey`
  - `Map.prototype.includes`
  - `Map.prototype.keyOf`
  - `Map.prototype.mapKeys`
  - `Map.prototype.mapValues`
  - `Map.prototype.merge`
  - `Map.prototype.reduce`
  - `Map.prototype.some`
  - `Map.prototype.update`
  - `Set.prototype.addAll`
  - `Set.prototype.deleteAll`
  - `Set.prototype.every`
  - `Set.prototype.filter`
  - `Set.prototype.find`
  - `Set.prototype.join`
  - `Set.prototype.map`
  - `Set.prototype.reduce`
  - `Set.prototype.some`
  - `WeakMap.prototype.deleteAll`
  - `WeakSet.prototype.addAll`
  - `WeakSet.prototype.deleteAll`
- [`String.prototype.replaceAll`](https://github.com/tc39/proposal-string-replace-all) stage 1 proposal
- [`String.prototype.codePoints`](https://github.com/tc39/proposal-string-prototype-codepoints) stage 1 proposal
- [`Array.prototype.last(Item|Index)`](https://github.com/keithamus/proposal-array-last) stage 1 proposal
- [`compositeKey` and `compositeSymbol` methods](https://github.com/bmeck/proposal-richer-keys/tree/master/compositeKey) stage 1 proposal
- [`Number.fromString`](https://github.com/tc39/proposal-number-fromstring) stage 1 proposal
- [`Math.seededPRNG`](https://github.com/tc39/proposal-seeded-random) stage 1 proposal
- [`Promise.any` (with `AggregateError`)](https://github.com/tc39/proposal-promise-any) stage 0 proposal

Some proposals have been largely changed, and `core-js` was updated accordingly:
- [`String.prototype.matchAll`](https://github.com/tc39/proposal-string-matchall) stage 3 proposal
- [`Observable`](https://github.com/tc39/proposal-observable) stage 1 proposal

#### Web standards

Many useful features have been added in this category.

The most important one is support for [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) and [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams). It was [one of the most popular feature requests](https://github.com/zloirock/core-js/issues/117). Adding `URL` and `URLSearchParams`, making maximally spec compliant, supporting any environment keeping their source code small compact was [one of the hardest tasks](https://github.com/zloirock/core-js/pull/454/files) in the `core-js@3` development.

`core-js@3` includes *a standard* method to create microtasks in JavaScript: [`queueMicrotask`](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#microtask-queuing). `core-js@2` provided the `asap` function which did the same thing and was an old ECMAScript proposal. `queueMicrotask` is defined in the HTML standard and it is already available in modern engines like Chromium or NodeJS.

Another popular feature request was support for the [`.forEach` method on DOM collection](https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach). Since `core-js` already polyfilled iterators of DOM collections, why not add also `.forEach` to `NodeList` and `DOMTokenList`?

#### Removed obsolete featues:

- `Reflect.enumerate` because it's removed from the spec
- `System.global` and `global` since now they are replaced by `globalThis`
- `Array.prototype.flatten` since it's replaced by `Array.prototype.flat`
- `asap` since it's replaced by `queueMicrotask`
- `Error.isError` has withdrawn a long time ago
- `RegExp.escape` rejected a long time ago
- `Map.prototype.toJSON` and `Set.prototype.toJSON` also rejected a long time ago
- Unnecessary `CSSRuleList`, `MediaList`, `StyleSheetList` iteration methods which were added mistakenly


#### No more non-standard non-proposed features

Many years ago, I started writing a library which I needed as the core of my JavaScript applications: this library contained polyfills and some utilities for common needs. After some time, it was published as `core-js`. I think that at this moment most `core-js` users do not use non-standard `core-js` features. Almost all of them were removed in previous releases, and it's time to remove all the remaining ones from `core-js`. Starting from this release, `core-js` can be finally called a polyfill.

### Packages, entry points and modules names

A popular issue was the big size (~2MB) of the `core-js` package and duplication of many of its files. For this reason, `core-js` was split into three packages:
- [`core-js`](https://www.npmjs.com/package/core-js), which defines global polyfills. (~500KB, [40KB minified and gzipped](https://bundlephobia.com/result?p=core-js@3.0.0-beta.20))
- [`core-js-pure`](https://www.npmjs.com/package/core-js-pure), which provides polyfills without pollution the global environment. It's the equivalent of `core-js/library` from `core-js@2`. (~440KB)
- [`core-js-bundle`](https://www.npmjs.com/package/core-js-bundle): a bundled version of `core-js` which defines global polyfills.

In previous versions of `core-js`, modules with polyfills for stable ECMAScript features and ECMAScript proposals were prefixed with `es6.` and `es7.` respectively. It was a decision taken in 2014 when all the features which could be after ES6 were considered as ES7. In `core-js@3` all stable ECMAScript features are prefixed with `es.`, while ECMAScript proposals with `esnext.`.

Almost all CommonJS entry points were changed. In `core-js@3` there are many more entry points than there were in `core-js@2`: they bring maxinum flexibility, making it possible to include only the polyfills needed by your application.

Here are some examples of how the new entry points can be used:
```js
// polyfill all `core-js` features:
import "core-js";
// polyfill only stable `core-js` features - ES and web standards:
import "core-js/stable";
// polyfill only stable ES features:
import "core-js/es";

// if you want to polyfill `Set`:
// all `Set`-related features, with ES proposals:
import "core-js/features/set";
// stable required for `Set` ES features and features from web standards
// (DOM collections iterator in this case):
import "core-js/stable/set";
// only stable ES features required for `Set`:
import "core-js/es/set";
// the same without global namespace pollution:
import Set from "core-js-pure/features/set";
import Set from "core-js-pure/stable/set";
import Set from "core-js-pure/es/set";

// if you want to polyfill just required methods:
import "core-js/features/set/intersection";
import "core-js/stable/queue-microtask";
import "core-js/es/array/from";

// polyfill reflect metadata proposal:
import "core-js/proposals/reflect-metadata";
// polyfill all stage 2+ proposals:
import "core-js/stage/2";
```

### Some other important changes

It's now possible to [configure the aggressiveness](https://github.com/zloirock/core-js/blob/master/README.md#configurable-level-of-aggressiveness) of `core-js` polyfills. If you think that `core-js` feature detection is too aggressive in some cases and that the native implementation is correct enough for your usecase, or if an incorrect implementation isn't detected by `core-js` as such, you can change the `core-js` default behavior.

If a feature can't be implemented following the specification in every details, `core-js` adds a `.sham` property to the polyfill. For example, in IE11 `Symbol.sham` is `true`.

No more LiveScript! When I started the `core-js` project, I mainly used [LiveScript](http://livescript.net/); after some time, I rewrote all the polyfills in JavaScript. Tests and helper tools in `core-js@2` still used LiveScript: it is a very interesting CoffeeScript-like language with powerful syntax sugar which allows writing very compact code, but now it's almost dead. Other than that, it was an additional barrier for contributing to `core-js` because a most `core-js` users do not know this language. `core-js@3` tests and tools use modern ES syntax: it could be a good moment to start contributing to `core-js` 🙂

For almost all users, for optimization of `core-js` import, I recommend using [`babel`](#Babel). However, for some cases still useful [`core-js-builder`](http://npmjs.com/package/core-js-builder). Now it supports the `targets` argument which takes a [`browserslist`](https://github.com/browserslist/browserslist) query with target engines - you can create a bundle which contains only required for target engines polyfills. For cases like this, I made the [`core-js-compat`](http://npmjs.com/package/core-js-compat) package, more info about it you could find in [`@babel/preset-env` part of this article](#babelpreset-env).

---

This is just the tip of the iceberg, much more changes were done internally. You can find more info about `core-js` changes in the [changelog](https://github.com/zloirock/core-js/blob/master/CHANGELOG.md#300).

## Babel

As mentioned above, `babel` and `core-js` are tightly integrated: `babel` gives the possibility of optimizing the `core-js` import as much as possible. A serious part of work on `core-js@3` was improving `core-js`-related `babel` features (see [this PR](https://github.com/babel/babel/pull/7646)). Those changes are published in [Babel 7.4.0](https://babeljs.io/blog/2019/03/19/7.4.0).

### `@babel/polyfill`

[`@babel/polyfill`](https://babeljs.io/docs/en/next/babel-polyfill.html) is a wrapper package which only includes imports of stable `core-js` features (in Babel 6 it also included proposals) and `regenerator-runtime/runtime`, needed by transpiled generators and async functions. This package doesn't make it possible to provide a smooth migration path from `core-js@2` to `core-js@3`: for this reason, it was decided to deprecate `@babel/polyfill` in favor of separate inclusion of required parts of `core-js` and `regenerator-runtime`.

Instead of
```js
import "@babel/polyfill";
```
you should use those 2 lines:
```js
import "core-js/stable";
import "regenerator-runtime/runtime";
```

Don't forget install those dependencies directly!

```sh
npm i --save core-js regenerator-runtime
```

### `@babel/preset-env`

[`@babel/preset-env`](https://babeljs.io/docs/en/next/babel-preset-env#usebuiltins) has 2 different modes, which can be enabled with the `useBuiltIns` option: `entry` and `usage`, which optimize imports of `core-js` in different ways.

Babel 7.4.0 introduces both changes commons to the two modes and specific to each mode.

Since `@babel/preset-env` now supports `core-js@2` and `core-js@3`, `useBuiltIns` requires setting a new option, `corejs`, which specifies the used version (`corejs: 2` or `corejs: 3`). If it isn't directly set, `corejs: 2` will be used by default and it will show a warning.

To make it possible for Babel to support new `core-js` features introduced in future minor versions, you also can specify the minor `core-js` version used in your project. For example, if you want to use `core-js@3.1` and take advantage of new features added in that version, you can set the `corejs` option to `3.1`: `corejs: '3.1'` or `corejs: { version: '3.1' }`.

One of the most important parts of `@babel/preset-env` was the source providing data about the features supported by different target engines, to understand whether something needs to be polyfilled by `core-js` or not. [`caniuse`](https://caniuse.com/), [`mdn`](https://developer.mozilla.org/en-US/) and [`compat-table`](http://kangax.github.io/compat-table/es6/) are good educational resources but aren't really meant to be used as data sources for developer tools: only the `compat-table` contains a good set of ES-related data and it is used by `@babel/preset-env`, but it has some limitations:
- it contains data only about ECMAScript features and proposals, but not about web platform features like `setImmediate` or DOM collections iterators. So, up to now, `@babel/preset-env` added all web platform features from `core-js` even for targets where they are supported.
- it does not contain any information about (even serious) bugs in engines: for example, already mentioned `Array#reverse` broken in Safari 12 but it isn't marked as unsupported by `compat-table`. On the other hand, `core-js` correctly fixes broken implementations, but with `compat-table` this capability wasn't taken advantage of.
- it contains only some basic and naive tests, which do not check that features work as they should in real-word cases. For example, old Safari has broken iterators without `.next` method, but `compat-table` shows them as supported because it just check that `typeof` of methods which should return iterators is `"function"`. Some features like typed arrays are almost completely not covered.
- `compat-table` is not designed for providing data for tools. I'm one of the `compat-table` maintainers, but [some of the other maintainers are against maintaining this functionality](https://github.com/kangax/compat-table/pull/1312).

For this reason, I created the [`core-js-compat`](https://github.com/zloirock/core-js/tree/master/packages/core-js-compat) package: it provides data about the necessity of `core-js` modules for different target engines. When using `core-js@3`, `@babel/preset-env` will use that new package instead of `compat-table`. [Please help us testing and providing data and mappings for missing engines! 😊](https://github.com/zloirock/core-js/blob/master/CONTRIBUTING.md#updating-core-js-compat-data)

Until Babel 7.3, `@babel/preset-env` had some problems related to the order polyfills were injected. Starting from version 7.4.0, `@babel/preset-env` will add the polyfills only when it know which of them required and in the recommended order.

#### `useBuiltIns: entry` with `corejs: 3`

When using this option, `@babel/preset-env` replaces direct imports of `core-js` to imports of only the specific modules required for a target environment.

Before those changes, `@babel/preset-env` replaced only `import '@babel/polyfill'` and `import 'core-js'`, they were synonyms and used for polyfilling all stable JavaScript features.

Since `@babel/polyfill` is now deprecated, `@babel/preset-env` doesn't transpile it when `corejs` is set to `3`.

An equivalent replacement for `@babel/polyfill` with `core-js@3` is
```js
import "core-js/stable";
import "regenerator-runtime/runtime";
```

When targeting `chrome 72`, it will be transformed by `@babel/preset-env` to
```js
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/web.immediate";
```

when targeting `chrome 73` (which completely support ES2019 standard library), it will just become a single smaller import:
```js
import "core-js/modules/web.immediate";
```

Since now `@babel/polyfill` is deprecated in favor of separate `core-js` and `regenerator-runtime` inclusion, we can optimize `regenerator-runtime` import. For this reason, `regenerator-runtime` import will be removed from the source code when targeting browsers that supports generators natively.

Now, `@babel/preset-env` in `useBuiltIns: entry` mode transpile **all available** `core-js` entry points and their combinations. This means that you can customize it as much as you want, by using different `core-js` entry points, and it will be optimized for your target environment.

For example, when targeting `chrome 72`,
```js
import "core-js/es";
import "core-js/proposals/set-methods";
import "core-js/features/set/map";
```
will be replaced with
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

#### `useBuiltIns: usage` with `corejs: 3`

When using this option, `@babel/preset-env` adds at the top of each file imports of polyfills only for features used in the current and not supported by target environments.

For example,
```js
const set = new Set([1, 2, 3]);
[1, 2, 3].includes(2);
```

when targeting an old browser like `ie 11`, will be transformed to
```js
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.set";

const set = new Set([1, 2, 3]);
[1, 2, 3].includes(2);
```

when targeting, for example, `chrome 72` no imports will be injected, since those polyfills not required for this target:
```js
const set = new Set([1, 2, 3]);
[1, 2, 3].includes(2);
```

Until Babel 7.3, `useBuiltIns: usage` was unstable and not fully reliable: many polyfills were not included, and many others were added without their required dependencies. In Babel 7.4, I tried to make it understand every possible usage pattern.

I improved the techniques used to determine which polyfills should be added on property accesses, object destructuring, `in` operator, global object property accesses.

`@babel/preset-env` now injections polyfills required for syntax features: iterators when using `for-of`, destructuring, spread and `yield` delegation; promises when using dynamic `import`, async functions and generators, etc.

Babel 7.4 supports injecting proposals polyfills. By default, `@babel/preset-env` does not inject them, but you can opt-in using the `proposals` flag: `corejs: { version: 3, proposals: true }`.

### `@babel/runtime`

When used with `core-js@3`, [`@babel/transform-runtime`](https://babeljs.io/docs/en/next/babel-plugin-transform-runtime#corejs) now injects polyfills from `core-js-pure`: a version of `core-js` which doesn't pollute the global namespace.

`core-js@3` and `@babel/runtime` have been integrated together by adding a `corejs: 3` option to `@babel/transform-runtime` and creating the `@babel/runtime-corejs3` package. But what advantages did this bring?

One of the most popular issue with `@babel/runtime` was that it did not support instance methods. Starting from `@babel/runtime-corejs3`, this problem has resolved. For example,
```js
array.includes(something);
```
will be transpiled to
```js
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/includes";

_includesInstanceProperty(array).call(array, something);
```

Another notable change is the support of ECMAScript proposals. By default, `@babel/plugin-transform-runtime` does not inject polyfills for proposals and use entry points which do not include them but, exactly as you can do in `@babel/preset-env`, you can set the `proposals` flag to enable them: `corejs: { version: 3, proposals: true }`.

Without `proposals` flag,
```js
new Set([1, 2, 3, 2, 1]);
string.matchAll(/something/g);
```
is transpiled to:
```js
import _Set from "@babel/runtime-corejs3/core-js-stable/set";

new _Set([1, 2, 3, 2, 1]);
string.matchAll(/something/g);
```
when proposals are enabled, it becomes:
```js
import _Set from "@babel/runtime-corejs3/core-js/set";
import _matchAllInstanceProperty from "@babel/runtime-corejs3/core-js/instance/match-all";

new _Set([1, 2, 3, 2, 1]);
_matchAllInstanceProperty(string).call(string, /something/g);
```

Some other old issues have been fixed. For example, this quite popular pattern didn't work when using `@babel/runtime-corejs2` but it is supported with `@babel/runtime-corejs3`.

```js
myArrayLikeObject[Symbol.iterator] = Array.prototype[Symbol.iterator];
```
Although previous versions of `@babel/runtime` did not work with instance methods, iterables (both `[Symbol.iterator]()` calls and its presence) were supported using some custom helper functions. Extracting the `[Symbol.iterator]` method was not supported, but now it works.

As a cheap bonus, `@babel/runtime` now supports IE8-, with some limitations. For example, since IE8- does not support accessors, modules transform should be used in loose mode and `regenerator-runtime` (which internally use some ES5+ built-ins) needs to be transpiled by this plugin.

## Look into the future

Much work has been done, but `core-js` is still far from perfect. How can the library and tools be improved in the future and how do language changes can affect it?

### Old engines support

At this moment, `core-js` tries to support all possible engines and platforms where we can test it: it even supports IE8- or, for example, early Firefox versions. While it is useful for some users, only for a small part of developers using `core-js` need it. For many other users, it can cause some problems like bigger bundle size or slower runtime execution.

The main problem comes from supporting ES3 engines (above all, IE8-): most modern ES features based on ES5 features, which aren't available in those very old browsers.

The biggest missing important feature are property descriptors: when they aren't available, some features can't be polyfilled because they either are accessors (like `RegExp.prototype.flags` or `URL` properties setters) or are accessors-based (like typed arrays polyfill). In order to workaround this lack, we need to use different workarounds (for example, to keep `Set.prototype.size` updated). Maintenance of those workarounds sometimes is too painful, and removing them would highly simplify many polyfills.

However, descriptors are just a part of this problem. The ES5 standard library contains many other features that can be considered as the basis of modern JavaScript: `Object.keys`, `Object.create`, `Object.getPrototypeOf`, `Array.prototype.forEach`, `Function.prototype.bind`, etc. Unlike the most modern features, `core-js` internally relies on them and [in order to implement even a simple modern function, `core-js` needs to load implementations of some of those "building blocks"](https://github.com/babel/babel/pull/7646#discussion_r179333093). It is a problem for users who want to create [a maximally minimalistic bundle](https://github.com/zloirock/core-js/issues/388) and only import just a few `core-js` polyfills.

In some countries IE8 still is quite popular, but browsers should disappear at some point to allow the web to move forward. IE8 was released 19-03-2009; today it is 19-03-2019: it's the 10th birthday of IE8. IE6 is about to turn 18: I stopped testing new `core-js` versions in IE6 some months ago.

We should drop IE8- and other engines without basic ES5 support in `core-js@4`.

### ECMAScript modules

`core-js` use `CommonJS` modules. It has the most popular JavaScript modules format for a long time, but now ECMAScript provides its own modules format. Many engines already support them; some bundlers (like `rollup`) are based on them, and some other bundlers provide them as an alternative to `CommonJS`. It would make sense to provide an alternative version of `core-js` which uses ECMAScript modules format.

### Extended web standards support?

`core-js` is currently focused on ECMAScript support, but it also supports a few web standards features which are available cross-platform and closely related to ECMAScript. Adding polyfills for web standards like `fetch` is a very popular feature request.

The main reason why `core-js` doesn’t include them was that it would have seriously increased bundles size and it would have forced `core-js` users to load features which might not have been needed. Now `core-js` is maximally modular, user can include only some choosen features, there are tools like `@babel/preset-env` and `@babel/runtime` which helps to get rid of unused or unnecessary polyfills.

Maybe it's time to revisit this old decision?

### `@babel/runtime` for target environment

Currently, we can't set the target environment as `@babel/runtime` like we can do for `@babel/preset-env`. That means that `@babel/runtime` injects all possible polyfills even when targeting modern engines: it unnecessarily increases the size of the final bundle.

Since `core-js-compat` contains all the necessary data, in the future, it will be possible to add support for compiling for a target environment to `@babel/runtime` and to add a `useBuiltIns: runtime` option to `@babel/preset-env`.

### Better optimization of polyfill loading

As explained above, Babel plugins give us different ways of optimizing `core-js` usage, but they are not perfect: we can improve them.

`@babel/preset-env` with `useBuiltIns: usage` now should work much better than before, but it could still fail in some uncommon cases: when the code can't be statically analyzed. For that case, we to find a way for library developers to specify which polyfills are required by their library instead of directly loading them: some kind of metadata, which will be used to inject polyfills when creating the final bundle.

Another issue of `useBuiltIns: usage` is the duplication of polyfills import. `useBuiltIns: usage` can inject dozens of `core-js` imports in each file. But what if in our project has thousands of files or even tenths of thousands? In this case, we will have more lines of code with `import "core-js/..."` than lines of code in `core-js` itself: we need a way to collect all imports to one file so that they can be deduplicated.

Almost every `@babel/preset-env` user which targets old engines like IE11 uses a single bundle for every browser. That means that even modern engines with full ES2019 support will be loading the unnecessary polyfills only required by IE11. Sure, we can create different bundles for different targets and use, for example, the `type=module` / `nomodules`  attributes: one bundle for modern engines with modules support, another for legacy engines. Unfortunately it’s not a complete solution to this problem: a service which bundles polyfills for the required target based on the user agent would be really useful. And we already have one - [`polyfill-service`](https://github.com/Financial-Times/polyfill-service). Although it is an interesting and popular service, polyfills quality leaves much to be desired. It’s not as bad as it was some years ago: the team of this project is actively working to improve it, but I wouldn't recommend using polyfills from this project if you want them to match native implementations. Some years ago was an attempt to use `core-js` as a polyfills source for this project, but it hadn't been possible because `polyfill-service` relies on files concatenation instead of modules (like `core-js` in the first few months after it was published 😊).

A service like this one integrated with a good polyfills source like `core-js`, which only loads the needed polyfills by statically analyzing the source like Babel's `useBuiltIns: usage` option does could cause a revolution in the way we think about polyfills.

### New features proposals from TC39 and possible problems for `core-js`

TC39 is working really hard to improve ECMAScript: you can see the progress by looking at all the new proposals implemented in `core-js`. However, I think that some features of some proposals could cause serious problems for polyfilling / transpiling. There would be enough to say about this topic to write a whole new post, but I'll try to summarize my thoughts here.

#### Standard library proposal, stage 1

At this moment, TC39 is considering adding to ECMAScript [built-in modules](https://github.com/tc39/proposal-javascript-standard-library): a modular standard library. It would be a great addition to JavaScript, and `core-js` is the best place where it could be polyfilled. With the techniques used in `@babel/preset-env` and `@babel/runtime`, we could theoretically inject polyfills for required built-in modules in a very simple way. However, the current version of this proposal causes some serious problems which don't make it as straightforward.

Polyfilling of built-in modules, [as stated by authors of the proposal](https://github.com/tc39/proposal-javascript-standard-library/issues/2), only means falling back to layered APIs or import maps. This means that if a native module will be missing, it will be possible to load a polyfill from a provided url. That's absolutely not what polyfills need, and it is incompatible with the architecture of `core-js` and every other popular polyfill projects. Import maps shouldn't be the only way to polyfill built-in modules.

We will be able to get a built-in module just by usage ES modules syntax with a special prefix. This syntax haven't any equal based on the previous version of the language - transpiled modules will not be able to interact with not transpiled in modern engines - it will cause problems for package distribution.

More other, it will work asynchronously. It's a critical problem for feature detection - scripts will not wait when you'll detect a feature and load a polyfill - feature detection should be done synchronously.

[The first implementation of built-in modules without a proper way of transpiling / polyfilling already available](https://developers.google.com/web/updates/2019/03/kv-storage). If it will not be revised, built-in modules will not be able to be polyfilled in the current `core-js` format. The proposed way of polyfilling will seriously complicate the lives of developers.

The issue with the standard library can be solved by adding a new global (maybe it will be the last one?): a registry of built-in modules which will allow getting and seting them synchronously, like
```js
StandardLibraryRegistry.get(moduleName);
StandardLibraryRegistry.set(moduleName, value);
```

Asynchronous fallbacks like layered APIs should be used only after this global registry.

As a bonus point, it would simplify transpiling native modules import to old syntax.

#### Decorators proposal, new iteration, stage 2

[In the new iteration](https://github.com/tc39/proposal-decorators) of this proposal, it has been seriously reworked. Decorator definitions aren't a syntax sugar anymore and, like with built-in modules, we will not be able to write a decorator in an old version of the language and use it as a native decorator. Other than that, decorators are not just usual identifiers - they live in a parallel lexical scope: this means that transpiled decorators can't interact with native decorators.

The proposal authors recommend distributing packages with untranspiled decorators and leave to the library consumers the choice to transpile their dependencies. However, it's not possible in different scenarios. This approach could prevent `core-js` from polyfilling new built-in decorators when they will be added to the JS standard library.

Decorators should be just an alternative way of applying functions on something, they should only be syntax sugar for wrappers. Why complicate things?

---

If a new language feature does not introduce to the language something fundamentally new, an alternative for what couldn't be implemented in a previous version of the language, we should be able to transpile and/or polyfill it, and transpiled/polyfilled code should be able to interact with native feature in engines which supports this feature natively.

I hope for the wisdom of the authors of those proposals and of the committee, that these proposals will be adapted so that it will be possible to properly transpile or polyfill them.

---

If you are interested in the `core-js` project or use it in your day-to-day work, you can become a sponsor on **[Open Collective](https://opencollective.com/core-js#sponsor)** or **[Patreon](https://www.patreon.com/zloirock)**. `core-js` isn't backed by a company: its future depends on you.

---

**Feel free to add comments to this article [here](https://github.com/zloirock/core-js/issues/496).**

**[Denis Pushkarev](https://github.com/zloirock)**, **19-03-2019**, *thanks [Nicolò Ribaudo](https://github.com/nicolo-ribaudo) for redaction*
