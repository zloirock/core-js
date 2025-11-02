# Usage
## Installation
```sh
// global version
npm install --save core-js@3.46.0
// version without global namespace pollution
npm install --save core-js-pure@3.46.0
// bundled global version
npm install --save core-js-bundle@3.46.0
```

## Entry points
You can import only-required-for-you polyfills, like in the examples at the top of `README.md`. Available CommonJS entry points for all polyfilled methods / constructors and namespaces. Just some examples:

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
import Set from "core-js-pure/full/set";
import Set from "core-js-pure/actual/set";
import Set from "core-js-pure/stable/set";
import Set from "core-js-pure/es/set";

// if you want to polyfill just the required methods:
import "core-js/full/set/intersection";
import "core-js/actual/array/find-last";
import "core-js/stable/queue-microtask";
import "core-js/es/array/from";

// polyfill iterator helpers proposal:
import "core-js/proposals/iterator-helpers";
// polyfill all stage 2+ proposals:
import "core-js/stage/2";
```

> [!TIP]
> The usage of the `/actual/` namespace is recommended since it includes all actual JavaScript features and does not include unstable early-stage proposals that are available mainly for experiments.

> [!WARNING]
> - The `modules` path is an internal API, does not inject all required dependencies and can be changed in minor or patch releases. Use it only for a custom build and/or if you know what are you doing.
> - If you use `core-js` with the extension of native objects, recommended to load all `core-js` modules at the top of the entry point of your application, otherwise, you can have conflicts.
>   - For example, Google Maps use their own `Symbol.iterator`, conflicting with `Array.from`, `URLSearchParams` and / or something else from `core-js`, see [related issues](https://github.com/zloirock/core-js/search?q=Google+Maps&type=Issues).
>   - Such conflicts are also resolvable by discovering and manually adding each conflicting entry from `core-js`.
> - `core-js` is extremely modular and uses a lot of very tiny modules, because of that for usage in browsers bundle up `core-js` instead of a usage loader for each file, otherwise, you will have hundreds of requests.

## CommonJS and prototype methods without global namespace pollution
In the `pure` version, we can't pollute prototypes of native constructors. Because of that, prototype methods transformed into static methods like in examples above. But with transpilers, we can use one more trick - [bind operator and virtual methods](https://github.com/tc39/proposal-bind-operator). Special for that, available `/virtual/` entry points. Example:
```ts
import fill from 'core-js-pure/actual/array/virtual/fill';
import findIndex from 'core-js-pure/actual/array/virtual/find-index';

Array(10)::fill(0).map((a, b) => b * b)::findIndex(it => it && !(it % 8)); // => 4
```

> [!WARNING]
> The bind operator is an early-stage ECMAScript proposal and usage of this syntax can be dangerous.

## Babel

`core-js` is integrated with `babel` and is the base for polyfilling-related `babel` features:

## `@babel/polyfill`

[`@babel/polyfill`](https://babeljs.io/docs/usage/polyfill) [**IS** just the import of stable `core-js` features and `regenerator-runtime`](https://github.com/babel/babel/blob/c8bb4500326700e7dc68ce8c4b90b6482c48d82f/packages/babel-polyfill/src/index.js) for generators and async functions, so loading `@babel/polyfill` means loading the global version of `core-js` without ES proposals.

Now it's deprecated in favor of separate inclusion of required parts of `core-js` and `regenerator-runtime` and, for backward compatibility, `@babel/polyfill` is still based on `core-js@2`.

As a full equal of `@babel/polyfill`, you can use the following:
```ts
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

## `@babel/preset-env`

[`@babel/preset-env`](https://github.com/babel/babel/tree/master/packages/babel-preset-env) has `useBuiltIns` option, which optimizes the use of the global version of `core-js`. With `useBuiltIns` option, you should also set `corejs` option to the used version of `core-js`, like `corejs: '3.46'`.

> [!IMPORTANT]
> It is recommended to specify the used minor `core-js` version, like `corejs: '3.46'`, instead of `corejs: 3`, since with `corejs: 3` will not be injected modules which were added in minor `core-js` releases.

---

- `useBuiltIns: 'entry'` replaces imports of `core-js` to import only required for a target environment modules. So, for example,
```ts
import 'core-js/stable';
```
with `chrome 71` target will be replaced just to:
```ts
import 'core-js/modules/es.array.unscopables.flat';
import 'core-js/modules/es.array.unscopables.flat-map';
import 'core-js/modules/es.object.from-entries';
import 'core-js/modules/web.immediate';
```
It works for all entry points of global version of `core-js` and their combinations, for example for
```ts
import 'core-js/es';
import 'core-js/proposals/set-methods';
import 'core-js/full/set/map';
```
with `chrome 71` target you will have as the result:
```ts
import 'core-js/modules/es.array.unscopables.flat';
import 'core-js/modules/es.array.unscopables.flat-map';
import 'core-js/modules/es.object.from-entries';
import 'core-js/modules/esnext.set.difference';
import 'core-js/modules/esnext.set.intersection';
import 'core-js/modules/esnext.set.is-disjoint-from';
import 'core-js/modules/esnext.set.is-subset-of';
import 'core-js/modules/esnext.set.is-superset-of';
import 'core-js/modules/esnext.set.map';
import 'core-js/modules/esnext.set.symmetric-difference';
import 'core-js/modules/esnext.set.union';
```

- `useBuiltIns: 'usage'` adds to the top of each file import of polyfills for features used in this file and not supported by target environments, so for:
```ts
// first file:
let set = new Set([1, 2, 3]);
```
```ts
// second file:
let array = Array.of(1, 2, 3);
```
if the target contains an old environment like `IE 11` we will have something like:
```ts
// first file:
import 'core-js/modules/es.array.iterator';
import 'core-js/modules/es.object.to-string';
import 'core-js/modules/es.set';

var set = new Set([1, 2, 3]);
```
```ts
// second file:
import 'core-js/modules/es.array.of';

var array = Array.of(1, 2, 3);
```

By default, `@babel/preset-env` with `useBuiltIns: 'usage'` option only polyfills stable features, but you can enable polyfilling of proposals by the `proposals` option, as `corejs: { version: '3.46', proposals: true }`.

> [!IMPORTANT]
> In the case of `useBuiltIns: 'usage'`, you should not add `core-js` imports by yourself, they will be added automatically.

## `@babel/runtime`

[`@babel/runtime`](https://babeljs.io/docs/plugins/transform-runtime/) with `corejs: 3` option simplifies work with the `core-js-pure`. It automatically replaces the usage of modern features from the JS standard library to imports from the version of `core-js` without global namespace pollution, so instead of:
```ts
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

> [!WARNING]
> If you use `@babel/preset-env` and `@babel/runtime` together, use `corejs` option only in one place since it's duplicate functionality and will cause conflicts.

## swc

Fast JavaScript transpiler `swc` [contains integration with `core-js`](https://swc.rs/docs/configuration/supported-browsers), that optimizes work with the global version of `core-js`. [Like `@babel/preset-env`](#babelpreset-env), it has 2 modes: `usage` and `entry`, but `usage` mode still works not so well as in `babel`. Example of configuration in `.swcrc`:
```json
{
  "env": {
    "targets": "> 0.25%, not dead",
    "mode": "entry",
    "coreJs": "3.46"
  }
}
```

## Configurable level of aggressiveness

By default, `core-js` sets polyfills only when they are required. That means that `core-js` checks if a feature is available and works correctly or not and if it has no problems, `core-js` uses native implementation.

But sometimes `core-js` feature detection could be too strict for your case. For example, `Promise` constructor requires the support of unhandled rejection tracking and `@@species`.

Sometimes we could have an inverse problem - a knowingly broken environment with problems not covered by `core-js` feature detection.

For those cases, we could redefine this behavior for certain polyfills:

```ts
const configurator = require('core-js/configurator');

configurator({
  useNative: ['Promise'],                                 // polyfills will be used only if natives are completely unavailable
  usePolyfill: ['Array.from', 'String.prototype.padEnd'], // polyfills will be used anyway
  useFeatureDetection: ['Map', 'Set'],                    // default behavior
});

require('core-js/actual');
```

It does not work with some features. Also, if you change the default behavior, even `core-js` internals may not work correctly.

## Custom build

For some cases could be useful to exclude some `core-js` features or generate a polyfill for target engines. You could use [`core-js-builder`](https://github.com/zloirock/core-js/tree/master/packages/core-js-builder) package for that.

## `postinstall` message
The `core-js` project needs your help, so the package shows a message about it after installation. If it causes problems for you, you can disable it:
```sh
ADBLOCK=true npm install
// or
DISABLE_OPENCOLLECTIVE=true npm install
// or
npm install --loglevel silent
```
