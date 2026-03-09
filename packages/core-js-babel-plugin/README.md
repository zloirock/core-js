![logo](https://user-images.githubusercontent.com/2213682/146607186-8e13ddef-26a4-4ebf-befd-5aac9d77c090.png)

<div align="center">

[![fundraising](https://opencollective.com/core-js/all/badge.svg?label=fundraising)](https://opencollective.com/core-js) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/zloirock/core-js/blob/master/CONTRIBUTING.md) [![version](https://img.shields.io/npm/v/@core-js/babel-plugin.svg)](https://www.npmjs.com/package/@core-js/babel-plugin)

</div>

Babel plugin for automatic injection of [`core-js`](https://core-js.io) polyfills. It analyzes your code and adds only the polyfills that are actually needed for your target environments. Works with both global (`core-js`) and pure (`@core-js/pure`) variants. [Documentation](https://core-js.io/docs/usage#corejs-babel-plugin).

## Methods

The plugin supports three injection methods: `entry-global`, `usage-global`, and `usage-pure`.

> [!IMPORTANT]
> You should specify the used minor `core-js` version, like `version: '4.1'`, instead of `version: '4'`.

### `entry-global`

Replaces imports of `core-js` to import only required for a target environment modules. So, for example,
```js
import 'core-js/actual';
```
with `chrome 135` target will be replaced to:
```js
import 'core-js/modules/es.suppressed-error.constructor';
import 'core-js/modules/es.async-disposable-stack.constructor';
import 'core-js/modules/es.disposable-stack.constructor';
import 'core-js/modules/es.iterator.concat';
import 'core-js/modules/es.regexp.escape';
// ...only the modules not yet supported by Chrome 135
```

It works for all entry points of global version of `core-js` and their combinations.

```json
{
  "plugins": [["@core-js", {
    "method": "entry-global",
    "version": "4.0",
    "targets": { "chrome": 135 }
  }]]
}
```

### `usage-global`

Automatically adds to the top of each file import of polyfills for features used in this file and not supported by target environments — no manual imports required. So, for example,
```js
const p = Promise.allSettled([f1, f2]);
'test'.at(-1);
```
if the target contains an old environment like `IE 11` we will have something like:
```js
import 'core-js/modules/es.promise.all-settled';
import 'core-js/modules/es.string.at';

const p = Promise.allSettled([f1, f2]);
'test'.at(-1);
```

> [!IMPORTANT]
> In the case of `usage-global`, you should not add `core-js` imports by yourself, they will be added automatically.

```json
{
  "plugins": [["@core-js", {
    "method": "usage-global",
    "version": "4.0",
    "targets": { "ie": 11 }
  }]]
}
```

### `usage-pure`

Like `usage-global`, but without global namespace pollution. It automatically replaces usage of modern features from the JS standard library to imports from `@core-js/pure`, so instead of:
```js
import from from '@core-js/pure/actual/array/from';
import at from '@core-js/pure/actual/instance/at';

from(items);
at([1, 2, 3]).call([1, 2, 3], -1);
```
you can write just:
```js
Array.from(items);
[1, 2, 3].at(-1);
```

```json
{
  "plugins": [["@core-js", {
    "method": "usage-pure",
    "version": "4.0",
    "targets": { "ie": 11 }
  }]]
}
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `method` | `string` | **required** | `'entry-global'`, `'usage-global'`, or `'usage-pure'` |
| `version` | `string` | `'4.0'` | Used `core-js` version, it's recommended to specify the used minor version like `'4.1'` |
| `targets` | `string` \| `object` | from browserslist config / all engines | Browserslist query or an object of minimum environment versions, same as [`@core-js/compat`](https://github.com/zloirock/core-js/tree/master/packages/core-js-compat) |
| `mode` | `string` | `'actual'` | Entry point layer: `'es'`, `'stable'`, `'actual'`, or `'full'` (makes no sense for `entry-global`) |
| `pkg` | `string` | `'core-js'` / `'@core-js/pure'` | Package name for import paths (defaults depend on `method`) |
| `pkgs` | `string[]` | `[]` | Additional package names to recognize as `core-js` (for `entry-global`) |
| `include` | `(string \| RegExp)[]` | `[]` | Force include specific polyfills by name or pattern |
| `exclude` | `(string \| RegExp)[]` | `[]` | Force exclude specific polyfills by name or pattern |
| `shouldInjectPolyfill` | `function` | `undefined` | Custom function to decide whether to inject a polyfill |
| `shippedProposals` | `boolean` | `false` | Treat proposals that have been shipped in browsers as stable features |
| `configPath` | `string` | `'.'` | Directory to search for a browserslist config file |
| `ignoreBrowserslistConfig` | `boolean` | `false` | Ignore browserslist config files, use only explicit `targets` |
| `absoluteImports` | `boolean` \| `string` | `false` | Use absolute paths for injected imports |
| `debug` | `boolean` | `false` | Print injected polyfills to console |

### `mode`

Controls which features are available:
- `'es'` — stable ECMAScript only
- `'stable'` — stable ECMAScript + web standards
- `'actual'` — stable + Stage 3 proposals (default)
- `'full'` — all features including early-stage proposals

```json
{
  "plugins": [["@core-js", {
    "method": "usage-global",
    "version": "4.0",
    "mode": "stable",
    "targets": { "firefox": 100, "safari": "15.4" }
  }]]
}
```

### `targets`

When `targets` is not specified, the plugin reads targets from your browserslist config (`.browserslistrc`, `browserslist` field in `package.json`, or `BROWSERSLIST` env variable). You can control where to look for the config with `configPath`, or disable config discovery with `ignoreBrowserslistConfig`.

```json
{
  "plugins": [["@core-js", {
    "method": "usage-global",
    "version": "4.0",
    "targets": { "chrome": 100, "firefox": 115, "safari": "16.4" }
  }]]
}
```

### `include` / `exclude`

Force include or exclude specific polyfills regardless of target environment. Accepts module names (like `es.array.from`) or regular expressions. Cannot be used together with `shouldInjectPolyfill`.

```json
{
  "plugins": [["@core-js", {
    "method": "usage-global",
    "version": "4.0",
    "targets": { "chrome": 135 },
    "include": ["es.array.from"],
    "exclude": ["es.string.at"]
  }]]
}
```

### `shouldInjectPolyfill`

A callback that gives full control over which polyfills are injected. It receives the polyfill module name and a boolean indicating whether it would be injected by default (based on targets), and returns a boolean. Cannot be used together with `include` / `exclude`.

```js
// babel.config.js
module.exports = {
  plugins: [['@core-js', {
    method: 'usage-global',
    version: '4.0',
    shouldInjectPolyfill(name, shouldInject) {
      // exclude object polyfills, keep everything else as-is
      if (name.startsWith('es.object.')) return false;
      return shouldInject;
    },
  }]],
};
```

### `shippedProposals`

When `true` and `mode` is `'es'` or `'stable'`, upgrades the effective mode to `'actual'`, allowing Stage 3+ proposals that have already been shipped in browsers to be included.

### `configPath`

Directory path to search for a browserslist config file. Useful in monorepos where the config is not in the project root.

```json
{
  "plugins": [["@core-js", {
    "method": "usage-global",
    "version": "4.0",
    "configPath": "./packages/my-app"
  }]]
}
```

### `ignoreBrowserslistConfig`

When `true`, the plugin will not read any browserslist config files. Only the explicitly provided `targets` will be used. If no `targets` are provided either, the target is assumed to be all engines — all polyfills will be injected.

### `absoluteImports`

When `true`, injected `core-js` imports will use absolute filesystem paths instead of package names. When a string, it will be used as the base path. This can be useful in monorepos to ensure that all files resolve to the same `core-js` installation.

### `debug`

When `true`, the plugin will log to the console all polyfills that are injected into each file.
