# Contributing

Contributions are always welcome. Feel free to ask [**@zloirock**](https://github.com/zloirock) if you have some questions.

## I want to help with code, but I don't know how

There is always some ["help wanted" issues](https://github.com/zloirock/core-js/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22help+wanted%22). You can look at them first. Sure, other help is also required - you could ask [**@zloirock**](https://github.com/zloirock) about it or open issues if you have some ideas.

## How to add a new polyfill

- The polyfill implementation should be added to the [`packages/core-js/modules`](./packages/core-js/modules) directory.
- The polyfill should properly work on all [supported engines](./docs/web/docs/engines.md) - the baseline is engines with at least IE11-level JavaScript features, approximately ES5 with some additions. If in some engines it cannot be implemented (for example, it strictly requires more modern ES or unavailable platform features), it should not break any other `core-js` features or application in any way.
- Avoid possible observing / breakage polyfills via patching built-ins at runtime: cache all global built-ins in the polyfills code and don't call prototype methods from instances.
- Shared helpers should be added to the [`packages/core-js/internals`](./packages/core-js/internals) directory. Reuse already existing helpers.
- Avoid direct import from `/modules/` path in `/internals|modules/` since it will break optimizations via Babel / `swc`. Specify such dependencies with comments like `// @dependency: es.string.iterator` directly in your module, they will be automatically added to entries, and use something like [`internals/get-built-in`](./packages/core-js/internals/get-built-in.js) helpers.
- For export the polyfill, in all common cases use [`internals/export`](./packages/core-js/internals/export.js) helper. Use something else only if this helper is not applicable - for example, if you want to polyfill accessors.
- If the code of the pure version implementation should significantly differ from the global version (*that's not a frequent situation, in most cases [`internals/is-pure`](./packages/core-js/internals/is-pure.js) constant is enough*), you can add it to [`packages/core-js-pure/override`](./packages/core-js-pure/override) directory. The rest parts of `@core-js/pure` will be copied from `core-js` package.
- Add the feature detection of the polyfill to [`tests/compat/tests.js`](./tests/compat/tests.js), add the compatibility data to [`packages/core-js-compat/src/data.mjs`](./packages/core-js-compat/src/data.mjs), how to do it [see below](#how-to-update-core-js-compat-data).
- Add it to entries definitions, see [`scripts/build-entries-and-types/entries-definitions.mjs`](scripts/build-entries-and-types/entries-definitions.mjs).
- Add the built-in to [`packages/core-js-compat/src/built-in-definitions.mjs`](./packages/core-js-compat/src/built-in-definitions.mjs), otherwise the injection plugins will never inject it, and, if the feature has a return type worth inferring, to [`packages/core-js-compat/src/known-built-in-return-types.mjs`](./packages/core-js-compat/src/known-built-in-return-types.mjs).
- Register the new built-in in [`tests/eslint/eslint.config.js`](./tests/eslint/eslint.config.js), so that the rules about unpolyfilled built-ins know it exists.
- Add TypeScript definitions for both versions, [see below](#typescript-type-definitions), and bind them to the module with a `// @types:` comment - `npm run types-coverage` requires it or the explicit `// @no-types` opt-out.
- Add unit tests to [`tests/unit-global`](./tests/unit-global) and [`tests/unit-pure`](./tests/unit-pure).
- Add tests of entry points to [`tests/entries/unit.mjs`](./tests/entries/unit.mjs).
- Regenerate the shared transpiler fixtures where the new entry changes their output, babel first: `OVERWRITE=1 npm run test-babel-plugin`, then `OVERWRITE=1 npm run test-unplugin`.
- Make sure that you are following [our coding style](#style-and-standards) and [all tests](#testing) are passed.
- Document it in [site documentation](./docs/web/docs/), list the new page in [`docs/web/docs/menu.json`](./docs/web/docs/menu.json) - a page missing from it is reachable only by its URL - add the feature to the list in [README.md](./README.md), and describe the change in [CHANGELOG.md](./CHANGELOG.md).

[A simple example of adding a new polyfill.](https://github.com/zloirock/core-js/pull/1294/files)

## How to update `@core-js/compat` data

For updating `@core-js/compat` data:

- If you want to add a new data for a browser, run in this browser `tests/compat/index.html` (tests and results for the actual release are available at [`http://zloirock.github.io/core-js/master/compat`](http://zloirock.github.io/core-js/master/compat)) and you will see what `core-js` modules are required for this browser.

![compat-table](https://user-images.githubusercontent.com/2213682/217452234-ccdcfc5a-c7d3-40d1-ab3f-86902315b8c3.png)

- If you want to add new data for NodeJS, run `npm run compat-node` with the installed required NodeJS version and you will see the results in the console. Use `npm run compat-node json` if you want to get the result as JSON.
- If you want to add new data for Deno, run `npm run compat-deno` with the installed required Deno version and you will see the results in the console. Use `npm run compat-deno json` if you want to get the result as JSON.
- If you want to add new data for Bun, run `npm run compat-bun` with the installed required Bun version and you will see the results in the console.
- If you want to add new data for Rhino, run `npm run compat-rhino YOUR_PATH_TO_RHINO` and you will see the results in the console.
- If you want to add new data for Hermes (incl. shipped with React Native), run `npm run compat-hermes YOUR_PATH_TO_HERMES` and you will see the results in the console.
- After getting this data, add it to [`packages/core-js-compat/src/data.mjs`](./packages/core-js-compat/src/data.mjs).
- If you want to add new mapping (for example, to add a new iOS Safari version based on Safari or NodeJS based on Chrome), add it to [`packages/core-js-compat/src/mapping.mjs`](./packages/core-js-compat/src/mapping.mjs).

engine            | how to run tests | base data inherits from    | mandatory check  | mapping for a new version
---               | ---              | ---                        | ---              | ---
`android`         | browser runner   | `chrome`, `chrome-android` |                  |
`bun`             | bun runner       | `safari` (only ES)         | required         |
`chrome`          | browser runner   |                            | required         |
`chrome-android`  | browser runner   | `chrome`                   |                  |
`deno`            | deno runner      | `chrome` (only ES)         | non-ES features  | required
`edge`            | browser runner   | `ie`, `chrome`             | required (<= 18) |
`electron`        | browser runner   | `chrome`                   |                  | required
`firefox`         | browser runner   |                            | required         |
`firefox-android` | browser runner   | `firefox`                  |                  |
`hermes`          | hermes runner    |                            | required         |
`ie`              | browser runner   |                            | required         |
`ios`             | browser runner   | `safari`                   |                  | if inconsistent (!= `safari`)
`node`            | node runner      | `chrome` (only ES)         | non-ES features  | required
`opera`           | browser runner   | `chrome`                   |                  | if inconsistent (!= `chrome` - 16)
`opera-android`   | browser runner   | `opera`, `chrome-android`  |                  | required
`quest`           | browser runner   | `chrome-android`           |                  | required
`react-native`    | hermes runner    | `hermes`                   | required         |
`rhino`           | rhino runner     |                            | required         |
`safari`          | browser runner   |                            | required         |
`samsung`         | browser runner   | `chrome-android`           |                  | required

If you have no access to all required browsers / versions of browsers, use [Sauce Labs](https://saucelabs.com/), [BrowserStack](https://www.browserstack.com/) or [Cloud Browser](https://ieonchrome.com/).

## TypeScript type definitions

- TypeScript definitions should be added to the [`packages/core-js-types/src/base`](./packages/core-js-types/src/base) directory.
- Our type definitions are built on top of ES6. If any related type is missing in ES6, it must be added to the [`packages/core-js-types/src/base/core-js-types`](./packages/core-js-types/src/base/core-js-types) directory and imported via triple-slash directives in your type definition file.
- Place your type definition into the folder that matches its kind ([`packages/core-js-types/src/base/proposals`](./packages/core-js-types/src/base/proposals), [`packages/core-js-types/src/base/web`](./packages/core-js-types/src/base/web)).
- Type definitions for the pure version are either generated from the global version types or created manually in the [`packages/core-js-types/src/base/pure`](./packages/core-js-types/src/base/pure) folder. Type build rules for the pure version can be modified using the `@type-options` directive:
  - `no-extends` – do not extend the base type when adding a prefix to the type/interface
  - `no-prefix` – do not add a prefix to the type/interface name
  - `no-constructor` – use it when the type has no constructor (for example, `Math`)
  - `export-base-constructor` – export the base type’s constructor instead of the prefixed one
  - `no-export` – do not export this type
  - `no-redefine` – do not redefine the type’s constructor
  - `prefix-return-type` – add a prefix to the return type
- All type definitions must be covered by TSC tests. Add them to the [`tests/type-definitions`](./tests/type-definitions) directory.
- To build the types, run the command:
  ```sh
  npm run build-types
  ```
- To test the types, run the command:
  ```sh
  npm run test-type-definitions-all
  ```
- To run the fast subset of the types test, run the command:
  ```sh
  npm run test-type-definitions
  ```

## Style and standards

The coding style should follow our [`eslint.config.js`](./tests/eslint/eslint.config.js). You can test it by calling [`npm run lint`](#testing), which also spell-checks the sources. Different places have different syntax and standard library limitations:
- Polyfill implementations should use only ES5 syntax, they should not use other polyfills from the global scope. Beyond ES5, they may rely on the additions of the baseline - basic `WeakMap`, basic `Map` and `Set`, the `%TypedArray%` / `ArrayBuffer` / `DataView` constructors, and a way of setting a prototype - for internal use only.
- Unit tests should use the modern syntax with our [minimalistic Babel config](./babel.config.js). Unit tests for the pure version should not use any modern standard library features.
- Tools, scripts and tests, performed in NodeJS, should use only the syntax and the standard library available in NodeJS ^22.18.0 || >=24.11.0.

File names should be in the kebab-case. Name of polyfill modules should follow the naming convention `namespace.subnamespace-where-required.feature-name`, for example, `es.set.intersection`. The top-level namespace should be `es` for stable ECMAScript features, `esnext` for ECMAScript proposals and `web` for other web standards.

## Testing

Before testing, you should prepare monorepo and install dependencies:
```sh
npm run prepare-monorepo
```
You can run the most tests by
```sh
npm t
```
You can run parts of the test case separately:
- Linting, the spelling check included:
  ```sh
  npm run lint
  ```
  The spelling check is [`codespell`](https://github.com/codespell-project/codespell), a Python package rather than a dependency of this repository, so install it separately - without it that step is skipped locally, while CI has it and fails on what it finds:
  ```sh
  pip install codespell
  ```
  It can be run on its own, optionally scoped to the files you changed:
  ```sh
  npm run codespell -- path/to/changed-file.js
  ```
- Unit test case in Karma (modern Chromium, Firefox, WebKit (Playwright), IE11 (if available)); the test bundles are built by the script itself, `bundle-package` provides the `core-js-bundle` legs:
  ```sh
  npx run-s prepare bundle-package test-unit-karma
  ```
- Unit test case in NodeJS:
  ```sh
  npx run-s prepare bundle-package test-unit-node
  ```
- Unit test case in Bun:
  ```sh
  npx run-s prepare bundle-package test-unit-bun
  ```
- End-to-end `usage-pure` transpiler tests (polyfilled code at runtime after the babel-plugin / unplugin transformations; the script builds its own bundles). In NodeJS (also part of `test-transpiling`):
  ```sh
  npx run-s prepare test-e2e-usage-pure
  ```
  In Karma (real browsers):
  ```sh
  npx run-s prepare test-e2e-usage-pure-karma
  ```
- [Test262](https://github.com/tc39/test262) test case (it's not included to the default tests):
  ```sh
  npx run-s prepare bundle-package test262
  ```
- [Promises/A+](https://github.com/promises-aplus/promises-tests) and [ES6 `Promise`](https://github.com/promises-es6/promises-es6) test cases:
  ```sh
  npx run-s prepare test-promises
  ```
- CommonJS entry points tests:
  ```sh
  npx run-s prepare test-entries
  ```
- `@core-js/compat` tools tests:
  ```sh
  npx run-s prepare test-compat-tools
  ```
- `@core-js/builder` tests:
  ```sh
  npx run-s prepare test-builder
  ```
- Transpiler plugins (`@core-js/babel-plugin`, `@core-js/unplugin`, `@core-js/polyfill-provider`) — shared fixture tests, cross-parser resolver, differential oracle, real-bundler integration and performance gates:
  ```sh
  npm run test-transpiling
  ```
  This is a composite of the individual runners below (run them separately to narrow down a failure):
  ```sh
  npm run test-polyfill-provider        # cross-parser type-resolver and detection tests
  npm run test-babel-plugin             # babel-plugin shared transpiler fixtures (@babel/core@8, default)
  npm run test-babel-plugin-unit        # babel-plugin internals (unit)
  npm run test-babel-plugin-v7          # babel-plugin fixtures against @babel/core@7 (skip list in tests/babel-plugin-v7/skip.mjs)
  npm run test-babel-plugin-unit-v7     # babel-plugin internals unit against @babel/core@7
  npm run test-unplugin                 # unplugin shared transpiler fixtures
  npm run test-unplugin-unit            # unplugin internals (unit)
  npm run test-e2e-usage-pure           # end-to-end usage-pure bundles in NodeJS (builds them first; Karma leg is separate)
  npm run test-transpiler-differential  # generated corpus: 3-way native == babel == unplugin + import-set parity + stripped-realm oracle; scope it with `pure` and/or `babel` / `unplugin`
  npm run test-transpiler-integration   # every supported bundler across methods and phases, runtime-verified
  npm run test-transpiler-perf          # complexity-class gates over real packages and synthetic worst-case shapes
  ```
- Real-library end-to-end suite — both polyfill providers (`@core-js/babel-plugin` and `@core-js/unplugin`) + Babel down-compile to the ES5 floor across RxJS, three.js, CodeMirror and the htmlparser2 stack (the TypeScript fixture: built from its own `src/**/*.ts`). babel-plugin has no phase axis, so its injected set is the reference and each unplugin phase is snapshotted as a delta against it. The browser leg runs Chromium, Firefox and WebKit anywhere, and adds real IE11 on CI or on a machine that has it:
  ```sh
  npm run test-e2e-libs                # the whole chain: check-exercise -> runtime -> karma
  npm run test-e2e-libs-check-exercise # run every exercise raw (no bundler, no polyfills)
  npm run test-e2e-libs-runtime        # one build per (lib x method x provider x phase) cell: gates, snapshot,
                                       # node pre-flight, ES5 UMD + self-checking HTML written as a page
                                       # (OVERWRITE=1 rewrites the injection snapshot baselines)
  npm run test-e2e-libs-karma-run      # run those pages in the browsers; needs `runtime` to have written them
  ```
  The three runners each take a library name to narrow on, as in `npm run test-e2e-libs-runtime three`.
- If you want to run tests in a certain browser, at first, you should build packages and test bundles:
  ```sh
  npx run-s prepare bundle
  ```
- For running the global version of the unit test case, use this file:
  ```sh
  tests/unit-browser/global.html
  ```
- For running the pure version of the unit test case, use this file:
  ```sh
  tests/unit-browser/pure.html
  ```
