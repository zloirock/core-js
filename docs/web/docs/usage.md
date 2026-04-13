# Usage
## Installation
```sh
npm install --save core-js@4.0.0-alpha.1
// version without global namespace pollution
npm install --save @core-js/pure@4.0.0-alpha.1
// bundled global version
npm install --save @core-js/bundle@4.0.0-alpha.1
```

## Entry points
You can import only-required-for-you polyfills, like in the examples at the top of `README.md`. Available CommonJS entry points for all polyfilled methods / constructors and namespaces. Just some examples:

```ts
// polyfill all `core-js` features, including early-stage proposals:
import 'core-js';
// or:
import 'core-js/full';
// polyfill all actual features - stable ES, web standards and stage 3 ES proposals:
import 'core-js/actual';
// polyfill only stable features - ES and web standards:
import 'core-js/stable';
// polyfill only stable ES features:
import 'core-js/es';

// if you want to polyfill `Set`:
// all `Set`-related features, with early-stage ES proposals:
import 'core-js/full/set';
// stable required for `Set` ES features, features from web standards and stage 3 ES proposals:
import 'core-js/actual/set';
// stable required for `Set` ES features and features from web standards
// (DOM collections iterator in this case):
import 'core-js/stable/set';
// only stable ES features required for `Set`:
import 'core-js/es/set';
// the same without global namespace pollution:
import Set from '@core-js/pure/full/set';
import Set from '@core-js/pure/actual/set';
import Set from '@core-js/pure/stable/set';
import Set from '@core-js/pure/es/set';

// if you want to polyfill just the required methods:
import 'core-js/full/set/intersection';
import 'core-js/actual/array/find-last';
import 'core-js/stable/queue-microtask';
import 'core-js/es/array/from';

// polyfill iterator helpers proposal:
import 'core-js/proposals/iterator-helpers';
// polyfill all stage 2+ proposals:
import 'core-js/stage/2';
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
In the `pure` version, we can't pollute prototypes of native constructors. Because of that, prototype methods transformed into static methods like in examples above. But with transpilers, we can use one more trick - [bind operator and prototype methods](https://github.com/tc39/proposal-bind-operator). Special for that, available `/prototype/` entry points. Example:
```ts
import fill from '@core-js/pure/actual/array/prototype/fill';
import findIndex from '@core-js/pure/actual/array/prototype/find-index';

Array(10)::fill(0).map((a, b) => b * b)::findIndex(it => it && !(it % 8)); // => 4
```

> [!WARNING]
> The bind operator is an early-stage ECMAScript proposal and usage of this syntax can be dangerous.

## Automatic polyfill injection

`core-js` provides plugins for automatic polyfill injection that analyze your code and add only the polyfills needed for your target environments:
- [`@core-js/babel-plugin`](#corejs-babel-plugin) - for projects using Babel
- [`@core-js/unplugin`](#corejs-unplugin) - for Vite, Webpack, Rollup, Rolldown, esbuild, Rspack, Farm, and Bun (no Babel required)

## `@core-js/babel-plugin`

[`@core-js/babel-plugin`](https://github.com/zloirock/core-js/tree/v4/packages/core-js-babel-plugin) is `core-js` babel plugin for automatic injection of polyfills. It analyzes your code and adds only the polyfills that are actually needed for your target environments. Works with both global (`core-js`) and pure (`@core-js/pure`) variants.

The plugin supports three injection methods: `entry-global`, `usage-global`, and `usage-pure`.

> [!IMPORTANT]
> You should specify the used minor `core-js` version, like `version: '4.1'`, instead of `version: '4'`.

---

- `method: 'entry-global'` replaces imports of `core-js` to import only required for a target environment modules. So, for example,
```ts
import 'core-js/actual';
```
with `chrome 135` target will be replaced to:
```ts
import 'core-js/modules/es.suppressed-error.constructor';
import 'core-js/modules/es.async-disposable-stack.constructor';
import 'core-js/modules/es.disposable-stack.constructor';
import 'core-js/modules/es.iterator.concat';
import 'core-js/modules/es.regexp.escape';
// ...only the modules not yet supported by Chrome 135
```
It works for all entry points of global version of `core-js` and their combinations.

- `method: 'usage-global'` automatically adds to the top of each file import of polyfills for features used in this file and not supported by target environments - no manual imports required. So, for example,
```ts
const p = Promise.allSettled([f1, f2]);
'test'.at(-1);
```
if the target contains an old environment like `IE 11` we will have something like:
```ts
import 'core-js/modules/es.promise.all-settled';
import 'core-js/modules/es.string.at';

const p = Promise.allSettled([f1, f2]);
'test'.at(-1);
```

> [!IMPORTANT]
> In the case of `usage-global`, you should not add `core-js` imports by yourself, they will be added automatically.

- `method: 'usage-pure'` is like `usage-global`, but without global namespace pollution. It automatically replaces usage of modern features from the JS standard library to imports from `@core-js/pure`, so instead of:
```ts
import from from '@core-js/pure/actual/array/from';
import at from '@core-js/pure/actual/instance/at';

from(items);
at([1, 2, 3]).call([1, 2, 3], -1);
```
you can write just:
```ts
Array.from(items);
[1, 2, 3].at(-1);
```

Configuration example:
```json
{
  "plugins": [["@core-js", {
    "method": "usage-global",
    "version": "node_modules",
    "targets": { "ie": 11 }
  }]]
}
```

### `@core-js/babel-plugin` options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `method` | `string` | **required** | `'entry-global'`, `'usage-global'`, or `'usage-pure'` |
| `version` | `string` | `'node_modules'` | Used `core-js` version, auto-detected from installed `core-js` by default. Can be a semver string with minor component like `'4.1'`. Special values: `'node_modules'` reads the version from the installed `core-js` package, `'package.json'` reads the version range from the project's `package.json` dependencies |
| `targets` | `string` \| `object` | from project browserslist config if present | Browserslist query or an object of minimum environment versions, same as [`@core-js/compat`](https://github.com/zloirock/core-js/tree/v4/packages/core-js-compat) |
| `mode` | `string` | `'actual'` | Entry point layer: `'es'`, `'stable'`, `'actual'`, or `'full'` |
| `package` | `string` | `'core-js'` / `'@core-js/pure'` | Package name for import paths (defaults depend on `method`) |
| `additionalPackages` | `string[]` | `[]` | Additional package names to recognize as `core-js` (for `entry-global`) |
| `include` | `(string \| RegExp)[]` | `[]` | Force include specific polyfills by name or pattern |
| `exclude` | `(string \| RegExp)[]` | `[]` | Force exclude specific polyfills by name or pattern |
| `shouldInjectPolyfill` | `function` | `undefined` | Custom callback `(name, defaultShouldInject) => boolean` |
| `shippedProposals` | `boolean` | `false` | Treat shipped proposals as stable features |
| `importStyle` | `string` | auto | `'import'` or `'require'`, auto-detected from `sourceType` |
| `configPath` | `string` | auto | Directory to search for browserslist config (for monorepos) |
| `ignoreBrowserslistConfig` | `boolean` | `false` | Do not use browserslist config |
| `absoluteImports` | `boolean` | `false` | Use absolute paths for injected imports |
| `debug` | `boolean` | `false` | Print injected polyfills to console |

### Disable comments

You can use comments to disable polyfill injection for specific lines or entire files, similar to ESLint disable comments:

```ts
// core-js-disable-file
```
Disables polyfill injection for the entire file. Must appear anywhere in the file.

```ts
arr.includes(x); // core-js-disable-line
```
Disables polyfill injection for the current line.

```ts
// core-js-disable-next-line
arr.includes(x);
```
Disables polyfill injection for the next line.

Both `//` and `/* */` comment styles are supported. You can add a reason after ` -- `:
```ts
// core-js-disable-next-line -- custom includes implementation
arr.includes(x);
```

## `@core-js/unplugin`

[`@core-js/unplugin`](https://github.com/zloirock/core-js/tree/v4/packages/core-js-unplugin) is a universal plugin for automatic injection of `core-js` polyfills that works with **Vite**, **Webpack**, **Rollup**, **Rolldown**, **esbuild**, **Rspack**, **Farm**, and **Bun** via [unplugin](https://github.com/unjs/unplugin). An alternative to `@core-js/babel-plugin` for projects that don't use Babel.

It supports the same three methods (`entry-global`, `usage-global`, `usage-pure`), the same options, and the same disable comments as `@core-js/babel-plugin`. Uses [oxc-parser](https://github.com/nicolo-ribaudo/oxc-parser) for fast parsing with native TypeScript support.

```sh
npm install @core-js/unplugin
```

### Vite
```ts
// vite.config.js
import coreJS from '@core-js/unplugin/vite';

export default {
  plugins: [coreJS({
    method: 'usage-global',
    version: 'node_modules',
    targets: { chrome: 80 },
  })],
};
```

### Webpack
```ts
// webpack.config.js
const coreJS = require('@core-js/unplugin/webpack');

module.exports = {
  plugins: [coreJS({
    method: 'usage-global',
    version: 'node_modules',
    targets: { chrome: 80 },
  })],
};
```

### Rolldown / Rollup
```ts
// rolldown.config.js / rollup.config.js
import coreJS from '@core-js/unplugin/rolldown'; // or '@core-js/unplugin/rollup'

export default {
  plugins: [coreJS({
    method: 'usage-global',
    version: 'node_modules',
    targets: { chrome: 80 },
  })],
};
```

### esbuild
```ts
import * as esbuild from 'esbuild';
import coreJS from '@core-js/unplugin/esbuild';

await esbuild.build({
  plugins: [coreJS({
    method: 'usage-global',
    version: 'node_modules',
    targets: { chrome: 80 },
  })],
});
```

### Rspack
```ts
// rspack.config.js
const coreJS = require('@core-js/unplugin/rspack');

module.exports = {
  plugins: [coreJS({
    method: 'usage-global',
    version: 'node_modules',
    targets: { chrome: 80 },
  })],
};
```

### Farm
```ts
// farm.config.ts
import coreJS from '@core-js/unplugin/farm';

export default {
  plugins: [coreJS({
    method: 'usage-global',
    version: 'node_modules',
    targets: { chrome: 80 },
  })],
};
```

### Bun
```ts
// build.ts
import coreJS from '@core-js/unplugin/bun';

await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  plugins: [coreJS({
    method: 'usage-global',
    version: 'node_modules',
    targets: { chrome: 80 },
  })],
});
```

### `@core-js/unplugin` options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `method` | `string` | **required** | `'entry-global'`, `'usage-global'`, or `'usage-pure'` |
| `version` | `string` | `'node_modules'` | Used `core-js` version, auto-detected from installed `core-js` by default. Can be a semver string with minor component like `'4.1'`. Special values: `'node_modules'`, `'package.json'` |
| `targets` | `string` \| `string[]` \| `object` | from project browserslist config if present | Browserslist targets |
| `mode` | `string` | `'actual'` | Entry point layer: `'es'`, `'stable'`, `'actual'`, or `'full'` |
| `package` | `string` | `'core-js'` / `'@core-js/pure'` | Package name for import paths |
| `additionalPackages` | `string[]` | `[]` | Additional package names to recognize as `core-js` |
| `include` | `(string \| RegExp)[]` | `[]` | Force include specific polyfills |
| `exclude` | `(string \| RegExp)[]` | `[]` | Force exclude specific polyfills |
| `shouldInjectPolyfill` | `function` | `undefined` | Custom callback `(name, defaultShouldInject) => boolean` |
| `shippedProposals` | `boolean` | `false` | Treat shipped proposals as stable features |
| `importStyle` | `string` | auto | `'import'` or `'require'`, auto-detected from source type |
| `configPath` | `string` | auto | Directory to search for browserslist config (for monorepos) |
| `ignoreBrowserslistConfig` | `boolean` | `false` | Do not use browserslist config |
| `absoluteImports` | `boolean` | `false` | Use absolute paths for injected imports |
| `debug` | `boolean` | `false` | Print debug output |

> [!NOTE]
> `@core-js/unplugin` does not support Flow syntax (oxc-parser limitation).

## `@babel/preset-env`

> [!TIP]
> [`@core-js/babel-plugin`](#corejs-babel-plugin) is recommended over `@babel/preset-env` for `core-js` polyfill injection.

[`@babel/preset-env`](https://github.com/babel/babel/tree/master/packages/babel-preset-env) has `useBuiltIns` option, which optimizes the use of the global version of `core-js`. With `useBuiltIns` option, you should also set `corejs` option to the used version of `core-js`, like `corejs: '4.1'`.

> [!IMPORTANT]
> It is recommended to specify the used minor `core-js` version, like `corejs: '4.1'`, instead of `corejs: 4`, since with `corejs: 4` will not be injected modules which were added in minor `core-js` releases.

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
import 'core-js/modules/es.set.difference';
import 'core-js/modules/es.set.intersection';
import 'core-js/modules/es.set.is-disjoint-from';
import 'core-js/modules/es.set.is-subset-of';
import 'core-js/modules/es.set.is-superset-of';
import 'core-js/modules/es.set.symmetric-difference';
import 'core-js/modules/es.set.union';
import 'core-js/modules/esnext.set.map';
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
import 'core-js/modules/es.set.constructor';

var set = new Set([1, 2, 3]);
```
```ts
// second file:
import 'core-js/modules/es.array.of';

var array = Array.of(1, 2, 3);
```

By default, `@babel/preset-env` with `useBuiltIns: 'usage'` option only polyfills stable features, but you can enable polyfilling of proposals by the `proposals` option, as `corejs: { version: 'node_modules', proposals: true }`.

> [!IMPORTANT]
> In the case of `useBuiltIns: 'usage'`, you should not add `core-js` imports by yourself, they will be added automatically.

## `@babel/runtime`

> [!TIP]
> [`@core-js/babel-plugin`](#corejs-babel-plugin) with `method: 'usage-pure'` is recommended over `@babel/runtime` for `core-js` polyfill injection.

[`@babel/runtime`](https://babeljs.io/docs/plugins/transform-runtime/) with `corejs: 4` option simplifies work with the `@core-js/pure`. It automatically replaces the usage of modern features from the JS standard library to imports from the version of `core-js` without global namespace pollution, so instead of:
```ts
import from from '@core-js/pure/stable/array/from';
import flat from '@core-js/pure/stable/array/flat';
import Set from '@core-js/pure/stable/set';
import Promise from '@core-js/pure/stable/promise';

from(new Set([1, 2, 3, 2, 1]));
flat([1, [2, 3], [4, [5]]], 2);
Promise.resolve(32).then(x => console.log(x));
```
you can write just:
```ts
Array.from(new Set([1, 2, 3, 2, 1]));
[1, [2, 3], [4, [5]]].flat(2);
Promise.resolve(32).then(x => console.log(x));
```

By default, `@babel/runtime` only polyfills stable features, but like in `@babel/preset-env`, you can enable polyfilling of proposals by `proposals` option, as `corejs: { version: 4, proposals: true }`.

> [!WARNING]
> If you use `@babel/preset-env` and `@babel/runtime` together, use `corejs` option only in one place since it's duplicate functionality and will cause conflicts.

## `@babel/polyfill`

[`@babel/polyfill`](https://babeljs.io/docs/usage/polyfill) [**IS** just the import of stable `core-js@2` features and `regenerator-runtime`](https://github.com/babel/babel/blob/c8bb4500326700e7dc68ce8c4b90b6482c48d82f/packages/babel-polyfill/src/index.js) for generators and async functions, so loading `@babel/polyfill` means loading the global version of `core-js` without ES proposals.

Now it's deprecated in favor of separate inclusion of required parts of `core-js` and `regenerator-runtime` and, for backward compatibility, `@babel/polyfill` is still based on `core-js@2`.

As a full equal of `@babel/polyfill`, you can use the following:
```ts
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

## swc

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

## Custom build

For some cases could be useful to exclude some `core-js` features or generate a polyfill for target engines. You could use [`@core-js/builder`](https://github.com/zloirock/core-js/tree/v4/packages/core-js-builder) package for that.
