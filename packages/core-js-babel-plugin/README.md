![logo](https://user-images.githubusercontent.com/2213682/146607186-8e13ddef-26a4-4ebf-befd-5aac9d77c090.png)

<div align="center">

[![fundraising](https://opencollective.com/core-js/all/badge.svg?label=fundraising)](https://opencollective.com/core-js) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/zloirock/core-js/blob/v4/CONTRIBUTING.md) [![version](https://img.shields.io/npm/v/@core-js/babel-plugin.svg)](https://www.npmjs.com/package/@core-js/babel-plugin)

</div>

Babel plugin for automatic injection of [`core-js`](https://core-js.io) polyfills. It analyzes your code and adds only the polyfills that are actually needed for your target environments. Works with both global (`core-js`) and pure (`@core-js/pure`) variants. [Documentation](https://core-js.io/v4/docs/usage#h-core-jsbabel-plugin).

## Methods

The plugin supports three injection methods: `entry-global`, `usage-global`, and `usage-pure`.

> [!TIP]
> By default, the plugin auto-detects the installed version of the configured `package` (`version: 'node_modules'`). You can also specify it explicitly - the minor component is required, e.g. `version: '4.1'` (not `'4'`).

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
| `version` | `string` | `'node_modules'` | Used `core-js` version, auto-detected from the configured `package` in the project working directory by default. Can be a semver string with minor component like `'4.1'`. Special values: `'node_modules'`, `'package.json'` |
| `targets` | `string` \| `string[]` \| `object` | Babel targets, then project Browserslist config | Browserslist query, list of queries or an object of minimum environment versions, same as [`@core-js/compat`](https://github.com/zloirock/core-js/tree/v4/packages/core-js-compat) |
| `mode` | `string` | `'actual'` | Entry point layer: `'es'`, `'stable'`, `'actual'`, or `'full'` (makes no sense for `entry-global`) |
| `package` | `string` | `'core-js'` / `'@core-js/pure'` | Package name for import paths (defaults depend on `method`) |
| `additionalPackages` | `string[]` | `[]` | Additional package names to recognize as `core-js` |
| `include` | `(string \| RegExp)[]` | `[]` | Force include polyfills by module name, entry path (for pure version), or pattern. String patterns are **raw regex syntax** anchored to start/end (NOT globs) |
| `exclude` | `(string \| RegExp)[]` | `[]` | Force exclude polyfills - same pattern semantics as `include` |
| `shouldInjectPolyfill` | `function` | `undefined` | Custom function to decide whether to inject a polyfill |
| `configPath` | `string` | auto | Directory to search for browserslist config (for monorepos) |
| `browserslistEnv` | `string` | auto | Browserslist env name (falls back to `production` / `defaults`) |
| `ignoreBrowserslistConfig` | `boolean` | `false` | Skip the plugin's Browserslist lookup. Targets supplied by Babel still apply |
| `absoluteImports` | `boolean` | `false` | Resolve injected imports from the project working directory; missing entries throw |
| `importStyle` | `string` | auto | Import style for injected polyfills: `'import'` or `'require'`, auto-detected from surviving ESM syntax and source format if not set |
| `debug` | `boolean` | `false` | Print injected polyfills to console |

### `version`

The version of the configured `package` installed in your project. The plugin uses this to determine which polyfill modules and entry points are available.

By default, the version is auto-detected from the configured `package`, resolved from the project working directory (`'node_modules'`). You can also specify it explicitly as a semver string with the minor component, e.g. `'4.1'` (not `'4'`).

Special values:
- `'node_modules'` (default) - reads the configured package's `package.json` (`core-js` for global methods, `@core-js/pure` for pure by default)
- `'package.json'` - reads the configured package's version range from the working directory's `package.json` `dependencies`, `devDependencies`, or `peerDependencies`, in that order

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

Additional package names to recognize as `core-js`. By default, only `core-js` is recognized. If you re-export `core-js` from another package, add it here so the plugin can process those imports too. Applies to every method: in `entry-global` the extra names are treated as entry points, while in `usage-global` / `usage-pure` they are recognized alongside `core-js` for `Symbol.*` import detection.

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

Explicit plugin `targets` take priority. Otherwise the plugin uses Babel's targets from `api.targets()` when they name at least one engine. If Babel supplies none, the plugin reads the project's Browserslist config. Use `configPath` to choose the directory for that lookup. With no configured targets, every used feature is eligible for injection.

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

Force include or exclude specific polyfills regardless of target environment. Accepts module names (like `es.array.from`), entry point paths (for pure version, like `array/from`), or regular expressions. Entry point paths are automatically expanded to the corresponding module names. Nonempty lists cannot be used with `shouldInjectPolyfill`.

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

The callback receives the module name and the default decision for the targets. Return the same boolean for those inputs across files using this configuration. Results may be reused. Nonempty `include` or `exclude` lists are incompatible with this callback.

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

Skips the plugin's own Browserslist lookup. Explicit plugin targets and targets already resolved by Babel still apply, including any project configuration Babel read.

### `absoluteImports`

When `true`, injected `core-js` imports will use absolute filesystem paths instead of package names. The configured package is resolved from the project working directory, so all files use that installation. A missing package or entry raises an error instead of falling back to a bare import. With an explicit `version` and `absoluteImports: false`, the package need not be installed while transforming.

In a Node application, absolute ESM imports use the project's ESM export conditions and absolute CommonJS loads use its CommonJS conditions.

For files whose names contain `#` or `%`, standalone Babel emits an escaped URL for Node ESM. Webpack's `babel-loader` and Rollup's `@rollup/plugin-babel` identify their bundler automatically. When compiling separately for esbuild, Rollup or webpack, set Babel's `caller.name` to `'esbuild'`, `'rollup'` or `'webpack'` to emit the resolved filesystem path.

An export target with a URL query or fragment identifies a distinct module instance. In esbuild and Rollup, bundling such a target requires a resolver for `file:` URLs. When using webpack's `babel-loader` with Rspack, set Babel's `caller.name` to `'rspack'` so filenames containing `?` or `#` use Rspack's URL handling.

### `importStyle`

Controls the syntax of injected polyfill imports: `'import'` for ESM `import` statements, `'require'` for CJS `require()` calls. When not set, surviving ESM imports or exports select `import`; otherwise the source format (including the filename and explicit parse goal) determines the style. Setting this option changes injection syntax only, not the source language.

With `absoluteImports`, Babel recognizes its CommonJS transform in the same pass and resolves static imports to CommonJS targets. For a separate CommonJS compilation step, set `importStyle: 'require'`.

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
Disables polyfill injection for the entire file. Place the comment before the first non-directive statement. It can follow a directive such as `"use strict"`.

```js
arr.includes(x); // core-js-disable-line
```
Disables polyfill injection for the current line.

```js
// core-js-disable-next-line
arr.includes(x);
```
Disables polyfill injection for the next STATEMENT. For a one-line statement that is the next line; when the statement spans several lines - a function or class declaration, a multi-line call - the whole statement is covered, its body included.

Both `//` and `/* */` comment styles are supported. You can add a reason after ` -- `:
```js
// core-js-disable-next-line -- custom includes implementation
arr.includes(x);
```
