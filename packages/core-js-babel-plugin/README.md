![logo](https://user-images.githubusercontent.com/2213682/146607186-8e13ddef-26a4-4ebf-befd-5aac9d77c090.png)

<div align="center">

[![fundraising](https://opencollective.com/core-js/all/badge.svg?label=fundraising)](https://opencollective.com/core-js) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/zloirock/core-js/blob/master/CONTRIBUTING.md) [![version](https://img.shields.io/npm/v/@core-js/babel-plugin.svg)](https://www.npmjs.com/package/@core-js/babel-plugin)

</div>

Babel plugin for automatic injection of [`core-js`](https://core-js.io) polyfills. It analyzes your code and adds only the polyfills that are actually needed for your target environments. Works with both global (`core-js`) and pure (`@core-js/pure`) variants. [Documentation](https://core-js.io/docs/usage#corejs-babel-plugin).

## Methods

The plugin supports three injection methods: `entry-global`, `usage-global`, and `usage-pure`.

> [!TIP]
> By default, the plugin auto-detects the installed `core-js` version (`version: 'node_modules'`). You can also specify it explicitly - the minor component is required, e.g. `version: '4.1'` (not `'4'`).

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
    "version": "node_modules",
    "targets": { "chrome": 135 }
  }]]
}
```

### `usage-global`

Automatically adds to the top of each file import of polyfills for features used in this file and not supported by target environments - no manual imports required. So, for example,
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
    "version": "node_modules",
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
    "version": "node_modules",
    "targets": { "ie": 11 }
  }]]
}
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `method` | `string` | **required** | `'entry-global'`, `'usage-global'`, or `'usage-pure'` |
| `version` | `string` | `'node_modules'` | Used `core-js` version, auto-detected from installed `core-js` by default. Can be a semver string with minor component like `'4.1'`. Special values: `'node_modules'`, `'package.json'` |
| `targets` | `string` \| `object` | from project browserslist config if present | Browserslist query or an object of minimum environment versions, same as [`@core-js/compat`](https://github.com/zloirock/core-js/tree/master/packages/core-js-compat) |
| `mode` | `string` | `'actual'` | Entry point layer: `'es'`, `'stable'`, `'actual'`, or `'full'` (makes no sense for `entry-global`) |
| `package` | `string` | `'core-js'` / `'@core-js/pure'` | Package name for import paths (defaults depend on `method`) |
| `additionalPackages` | `string[]` | `[]` | Additional package names to recognize as `core-js` (for `entry-global`) |
| `include` | `(string \| RegExp)[]` | `[]` | Force include specific polyfills by module name, entry path (for pure version), or pattern |
| `exclude` | `(string \| RegExp)[]` | `[]` | Force exclude specific polyfills by module name, entry path (for pure version), or pattern |
| `shouldInjectPolyfill` | `function` | `undefined` | Custom function to decide whether to inject a polyfill |
| `shippedProposals` | `boolean` | `false` | Treat proposals that have been shipped in browsers as stable features |
| `configPath` | `string` | auto | Directory to search for browserslist config (for monorepos) |
| `ignoreBrowserslistConfig` | `boolean` | `false` | Do not use browserslist config, only explicit `targets` |
| `absoluteImports` | `boolean` | `false` | Use absolute paths for injected imports |
| `importStyle` | `string` | auto | Import style for injected polyfills: `'import'` or `'require'`, auto-detected from `sourceType` if not set |
| `debug` | `boolean` | `false` | Print injected polyfills to console |

### `version`

The `core-js` version installed in your project. The plugin uses this to determine which polyfill modules and entry points are available.

By default, the version is auto-detected from the installed `core-js` package (`'node_modules'`). You can also specify it explicitly as a semver string with the minor component, e.g. `'4.1'` (not `'4'`).

Special values:
- `'node_modules'` (default) - reads the version from the installed `core-js` package (`core-js/package.json`)
- `'package.json'` - reads the version range from the project's `package.json` `dependencies`, `devDependencies`, or `peerDependencies`

```json
{
  "plugins": [["@core-js", {
    "method": "usage-global",
    "version": "node_modules",
    "targets": { "ie": 11 }
  }]]
}
```

### `package`

The package name used in generated import paths. Defaults to `'core-js'` for `entry-global` and `usage-global`, and `'@core-js/pure'` for `usage-pure`.

Override this if you use a custom package name:

```json
{
  "plugins": [["@core-js", {
    "method": "usage-global",
    "version": "node_modules",
    "package": "my-core-js-version"
  }]]
}
```

### `additionalPackages`

Additional package names to recognize as `core-js` entry points in `entry-global` mode. By default, only `core-js` is recognized. If you re-export `core-js` from another package, add it here so the plugin can process those imports too.

```json
{
  "plugins": [["@core-js", {
    "method": "entry-global",
    "version": "node_modules",
    "package": "my-core-js-version",
    "additionalPackages": ["core-js"]
  }]]
}
```

### `mode`

Controls which features are available:
- `'es'` - stable ECMAScript only
- `'stable'` - stable ECMAScript + web standards
- `'actual'` - stable + Stage 3 proposals (default)
- `'full'` - all features including early-stage proposals

```json
{
  "plugins": [["@core-js", {
    "method": "usage-global",
    "version": "node_modules",
    "mode": "stable",
    "targets": { "firefox": 100, "safari": "15.4" }
  }]]
}
```

### `targets`

When `targets` is not specified, the plugin looks for a browserslist config in the project (`.browserslistrc`, `browserslist` field in `package.json`, or `BROWSERSLIST` env variable). If a config file is found, its targets are used; otherwise all engines are assumed and all polyfills will be injected. In Babel, targets can also be resolved automatically via `@babel/preset-env`. Use `configPath` to specify a custom config directory, or `ignoreBrowserslistConfig` to disable config auto-detection.

```json
{
  "plugins": [["@core-js", {
    "method": "usage-global",
    "version": "node_modules",
    "targets": { "chrome": 100, "firefox": 115, "safari": "16.4" }
  }]]
}
```

### `include` / `exclude`

Force include or exclude specific polyfills regardless of target environment. Accepts module names (like `es.array.from`), entry point paths (for pure version, like `array/from`), or regular expressions. Entry point paths are automatically expanded to the corresponding module names. Cannot be used together with `shouldInjectPolyfill`.

```json
{
  "plugins": [["@core-js", {
    "method": "usage-global",
    "version": "node_modules",
    "targets": { "chrome": 135 },
    "include": ["es.array.at"],
    "exclude": ["es.string.at"]
  }]]
}
```

```json
{
  "plugins": [["@core-js", {
    "method": "usage-pure",
    "version": "node_modules",
    "targets": { "chrome": 135 },
    "include": ["array/at"],
    "exclude": ["string/at"]
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
    version: 'node_modules',
    shouldInjectPolyfill(name, shouldInject) {
      // exclude object polyfills, keep everything else as-is
      if (name.startsWith('es.object.')) return false;
      return shouldInject;
    },
  }]],
};
```

### `shippedProposals`

When `true` and `mode` is `'es'` or `'stable'`, upgrades the effective mode to `'actual'`, allowing Stage 3+ proposals.

### `configPath`

Directory path to search for a browserslist config file. By default, the config is auto-detected from the project root. Useful in monorepos where the config is not in the project root.

```json
{
  "plugins": [["@core-js", {
    "method": "usage-global",
    "version": "node_modules",
    "configPath": "./packages/my-app"
  }]]
}
```

### `ignoreBrowserslistConfig`

When `true`, the plugin will not read any browserslist config files. Only the explicitly provided `targets` will be used. If no `targets` are provided either, the target is assumed to be all engines - all polyfills will be injected.

### `absoluteImports`

When `true`, injected `core-js` imports will use absolute filesystem paths instead of package names. This can be useful in monorepos to ensure that all files resolve to the same `core-js` installation.

### `importStyle`

Controls the syntax of injected polyfill imports: `'import'` for ESM `import` statements, `'require'` for CJS `require()` calls. When not set, auto-detected from the file's `sourceType` - `'script'` files get `require()`, `'module'` files get `import`.

```json
{
  "plugins": [["@core-js", {
    "method": "usage-global",
    "version": "node_modules",
    "importStyle": "require"
  }]]
}
```

### `debug`

When `true`, the plugin will log to the console all polyfills that are injected into each file.

## Disable comments

You can use comments to disable polyfill injection for specific lines or entire files, similar to ESLint disable comments:

```js
// core-js-disable-file
```
Disables polyfill injection for the entire file. Can appear anywhere in the file.

```js
arr.includes(x); // core-js-disable-line
```
Disables polyfill injection for the current line.

```js
// core-js-disable-next-line
arr.includes(x);
```
Disables polyfill injection for the next line.

Both `//` and `/* */` comment styles are supported. You can add a reason after ` -- `:
```js
// core-js-disable-next-line -- custom includes implementation
arr.includes(x);
```
