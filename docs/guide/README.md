---
icon: launch
category: guide
---

# Quick Start

::: tip
Core-JS is integrated into many build tools and you can quickly implement polyfill with them:

- [Babel](./babel.md)
- [SWC](./swc.md)

If you do need to use Core-JS manually, please continue reading the following section
:::

## Installation

```shell
# global version
npm install --save core-js@%COREJS_VERSION%
# version without global namespace pollution
npm install --save core-js-pure@%COREJS_VERSION%
# bundled global version
npm install --save core-js-bundle@%COREJS_VERSION%
```

Or you can use Core-JS [from CDN](https://www.jsdelivr.com/package/npm/core-js-bundle).

### `postinstall` message

The Core-JS project needs your help, so the package shows a message about it after installation. If it causes problems for you, you can disable it:

```shell
ADBLOCK=true npm install
# or
DISABLE_OPENCOLLECTIVE=true npm install
# or
npm install --loglevel silent
```

## CommonJS API

You can import only-required-for-you polyfills, like in examples at the homepage. Available CommonJS entry points for all polyfilled methods / constructors and namespaces. Just some examples:

```js
// polyfill all Core-JS features, including early-stage proposals:
import "core-js";
// or:
import "core-js/full";
// or use Deno:
import "https://deno.land/x/corejs@v%COREJS_VERSION%/index.js";
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

// if you want to polyfill just required methods:
import "core-js/full/set/intersection";
import "core-js/actual/array/find-last";
import "core-js/stable/queue-microtask";
import "core-js/es/array/from";

// polyfill iterator helpers proposal:
import "core-js/proposals/iterator-helpers";
// polyfill all stage 2+ proposals:
import "core-js/stage/2";
```

:::tip
The usage of the `/actual/` namespace is recommended since it includes all actual JavaScript features and does not include unstable early-stage proposals that are available mainly for experiments.
:::

### Caveats when using CommonJS API

- `modules` path is an internal API, does not inject all required dependencies and can be changed in minor or patch releases. Use it only for a custom build and/or if you know what are you doing.
- If you use Core-JS with the extension of native objects, recommended load all Core-JS modules at the top of the entry point of your application, otherwise, you can have conflicts.
  - For example, Google Maps use their own `Symbol.iterator`, conflicting with `Array.from`, `URLSearchParams` and/or something else from Core-JS, see [related issues](https://github.com/zloirock/core-js/search?q=Google+Maps&type=Issues).
  - Such conflicts also resolvable by discovering and manual adding each conflicting entry from Core-JS.
- Core-JS is extremely modular and uses a lot of very tiny modules, because of that for usage in browsers bundle up Core-JS instead of usage loader for each file, otherwise, you will have hundreds of requests.

### Use without global namespace pollution

In the `pure` version, we can't pollute prototypes of native constructors. Because of that, prototype methods transformed into static methods like in examples above. But with transpilers, we can use one more trick - [bind operator and virtual methods](https://github.com/tc39/proposal-bind-operator). Special for that, available `/virtual/` entry points. Example:

```js
import fill from "core-js-pure/actual/array/virtual/fill";
import findIndex from "core-js-pure/actual/array/virtual/find-index";

Array(10)
  ::fill(0)
  .map((a, b) => b * b)
  ::findIndex((it) => it && !(it % 8)); // => 4
```

::: warning
The bind operator is an early-stage ECMAScript proposal and usage of this syntax can be dangerous.
:::

## Configurable level of aggressiveness

By default, Core-JS sets polyfills only when they are required. That means that Core-JS checks if a feature is available and works correctly or not and if it has no problems, Core-JS use native implementation.

But sometimes Core-JS feature detection could be too strict for your case. For example, `Promise` constructor requires the support of unhandled rejection tracking and `@@species`.

Sometimes we could have inverse problem - knowingly broken environment with problems not covered by Core-JS feature detection.

For those cases, we could redefine this behaviour for certain polyfills:

```js
const configurator = require("core-js/configurator");

configurator({
  useNative: ["Promise"], // polyfills will be used only if natives completely unavailable
  usePolyfill: ["Array.from", "String.prototype.padEnd"], // polyfills will be used anyway
  useFeatureDetection: ["Map", "Set"], // default behaviour
});

require("core-js/actual");
```

It does not work with some features. Also, if you change the default behaviour, even Core-JS internals may not work correctly.

## Custom build

For some cases could be useful to exclude some Core-JS features or generate a polyfill for target engines. You could use [`core-js-builder`](/packages/core-js-builder) package for that.
