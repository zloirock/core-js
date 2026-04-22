![logo](https://user-images.githubusercontent.com/2213682/146607186-8e13ddef-26a4-4ebf-befd-5aac9d77c090.png)

<div align="center">

[![fundraising](https://opencollective.com/core-js/all/badge.svg?label=fundraising)](https://opencollective.com/core-js) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/zloirock/core-js/blob/master/CONTRIBUTING.md) [![version](https://img.shields.io/npm/v/@core-js/unplugin.svg)](https://www.npmjs.com/package/@core-js/unplugin)

</div>

Universal plugin for automatic injection of [`core-js`](https://core-js.io) polyfills. Works with **Vite**, **Webpack**, **Rollup**, **Rolldown**, **esbuild**, **Rspack**, **Bun**, and **Farm** via [unplugin](https://github.com/unjs/unplugin). Powered by [oxc-parser](https://github.com/nicolo-ribaudo/oxc-parser) for fast AST parsing with full TypeScript support.

An alternative to [`@core-js/babel-plugin`](https://www.npmjs.com/package/@core-js/babel-plugin) for projects that don't use Babel.

## Installation

```sh
npm install @core-js/unplugin
```

## Usage

### Vite

```js
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

```js
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
```js
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

```js
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

```js
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

```js
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

```js
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

## Methods

The plugin supports three injection methods: `entry-global`, `usage-global`, and `usage-pure`. They work the same way as in [`@core-js/babel-plugin`](https://www.npmjs.com/package/@core-js/babel-plugin).

### `entry-global`

Replaces `import 'core-js/...'` and `require('core-js/...')` with granular module imports for only the polyfills needed by the target environment.

### `usage-global`

Automatically detects usage of features that need polyfilling and injects the required `core-js` modules at the top of each file. No manual imports needed.

### `usage-pure`

Like `usage-global`, but replaces usage of standard library features with imports from `@core-js/pure`, without polluting the global namespace.

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `method` | `string` | **required** | `'entry-global'`, `'usage-global'`, or `'usage-pure'` |
| `version` | `string` | `'node_modules'` | Used `core-js` version, auto-detected from installed `core-js` by default. Can be a semver string with minor component like `'4.1'`. Special values: `'node_modules'`, `'package.json'` |
| `targets` | `string` \| `string[]` \| `object` | from project browserslist config if present | Browserslist query or an object of minimum environment versions |
| `mode` | `string` | `'actual'` | Entry point layer: `'es'`, `'stable'`, `'actual'`, or `'full'` |
| `package` | `string` | `'core-js'` / `'@core-js/pure'` | Package name for import paths (defaults depend on `method`) |
| `additionalPackages` | `string[]` | `[]` | Additional package names to recognize as `core-js` |
| `include` | `(string \| RegExp)[]` | `[]` | Force include polyfill modules or patterns. String patterns are **raw regex syntax** anchored to start/end (NOT globs) |
| `exclude` | `(string \| RegExp)[]` | `[]` | Force exclude polyfill modules - same pattern semantics as `include` |
| `shouldInjectPolyfill` | `function` | `undefined` | Custom function to decide whether to inject a polyfill |
| `shippedProposals` | `boolean` | `false` | Treat shipped proposals as stable features |
| `configPath` | `string` | auto | Directory to search for browserslist config (for monorepos) |
| `browserslistEnv` | `string` | auto | Browserslist env name (falls back to `production` / `defaults`) |
| `ignoreBrowserslistConfig` | `boolean` | `false` | Do not use browserslist config |
| `absoluteImports` | `boolean` | `false` | Use absolute paths for injected imports |
| `importStyle` | `string` | auto | `'import'` or `'require'`, auto-detected from source type if not set |
| `phase` | `'pre' \| 'post' \| 'pre+post'` | `'pre'` | When the plugin runs. `'pre'` - before sibling plugins, sees original source with full semantic context; misses polyfills in siblings' helpers. `'post'` - after siblings, sees helpers but TS stripping and other syntactic transforms by siblings make type inference unreliable, which may cause over-polyfilling. `'pre+post'` - two passes: pre transforms user code with full context, post detects helpers; post may still over-polyfill user code that siblings transformed between passes. Not supported for `entry-global` (always at pre so `import 'core-js'` is seen before siblings convert or tree-shake it) |
| `debug` | `boolean` | `false` | Print debug output |

## Disable comments

You can disable polyfill injection for specific lines or entire files using comments:

```js
// core-js-disable-file
```

```js
arr.includes(x); // core-js-disable-line
```

```js
// core-js-disable-next-line -- custom implementation
arr.includes(x);
```

Both `//` and `/* */` styles are supported. A reason can be added after ` -- `.

## Differences from `@core-js/babel-plugin`

- **No Babel required** - uses [oxc-parser](https://github.com/nicolo-ribaudo/oxc-parser) for parsing
- **Universal** - works with any bundler via unplugin
- **Same data** - uses the same `@core-js/compat` data and `@core-js/polyfill-provider` logic
- **Transform timing** - babel-plugin runs inside Babel's own pipeline and shares a single AST traversal with other Babel transforms (TS, class down-compile, etc.), always seeing the original source. The unplugin runs in the bundler plugin chain alongside separate TS/down-compile plugins; the `phase` option controls where in the chain it sits. The default `'pre'` sees the original source. `'post'` and `'pre+post'` can additionally scan code produced by siblings to catch polyfills in emitted helpers (e.g. `Symbol.iterator` in `_toConsumableArray`), at the cost of losing semantic context siblings may have stripped (type info in particular), which can over-polyfill
- **No Flow support** - oxc-parser does not support Flow syntax
