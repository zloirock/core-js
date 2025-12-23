# Contributing

Contributions are always welcome. Feel free to ask [**@zloirock**](https://github.com/zloirock) if you have some questions.

## I want to help with code, but I don't know how

There is always some ["help wanted" issues](https://github.com/zloirock/core-js/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22help+wanted%22). You can look at them first. Sure, other help is also required - you could ask [**@zloirock**](https://github.com/zloirock) about it or open issues if you have some ideas.

## How to add a new polyfill

- The polyfill implementation should be added to the [`packages/core-js/modules`](./packages/core-js/modules) directory.
- The polyfill should properly work in ES3 and all possible engines. If in some engines it cannot be implemented (for example, it strictly requires more modern ES or unavailable platform features), it should not break any other `core-js` features or application in any way.
- Avoid possible observing / breakage polyfills via patching built-ins at runtime: cache all global built-ins in the polyfills code and don't call prototype methods from instances.
- Shared helpers should be added to the [`packages/core-js/internals`](./packages/core-js/internals) directory. Reuse already existing helpers.
- Avoid direct import from `/modules/` path in `/internals|modules/` since it will break optimizations via Babel / `swc`. Specify such dependencies in `/es|stable|actual/full/` entries and use something like [`internals/get-built-in`](./packages/core-js/internals/get-built-in.js) helpers.
- For export the polyfill, in all common cases use [`internals/export`](./packages/core-js/modules/export.js) helper. Use something else only if this helper is not applicable - for example, if you want to polyfill accessors.
- If the code of the pure version implementation should significantly differ from the global version (*that's not a frequent situation, in most cases [`internals/is-pure`](./packages/core-js/modules/is-pure.js) constant is enough*), you can add it to [`packages/core-js-pure/override`](./packages/core-js-pure/override) directory. The rest parts of `core-js-pure` will be copied from `core-js` package.
- Add the feature detection of the polyfill to [`tests/compat/tests.js`](./tests/compat/tests.js), add the compatibility data to [`packages/core-js-compat/src/data.mjs`](./packages/core-js-compat/src/data.mjs), how to do it [see below](#how-to-update-core-js-compat-data), and the name of the polyfill module to [`packages/core-js-compat/src/modules-by-versions.mjs`](./packages/core-js-compat/src/modules-by-versions.mjs) (this data is also used for getting the default list of polyfills at bundling and generation indexes).
- Add it to entry points where it's required: directories [`packages/core-js/es`](./packages/core-js/es), [`packages/core-js/stable`](./packages/core-js/stable), [`packages/core-js/actual`](./packages/core-js/actual), [`packages/core-js/full`](./packages/core-js/full), [`packages/core-js/proposals`](./packages/core-js/proposals), [`packages/core-js/stage`](./packages/core-js/stage) and [`packages/core-js/web`](./packages/core-js/web).
- Add unit tests to [`tests/unit-global`](./tests/unit-global) and [`tests/unit-pure`](./tests/unit-pure).
- Add tests of entry points to [`tests/entries/unit.mjs`](./tests/entries/unit.mjs).
- Make sure that you are following [our coding style](#style-and-standards) and [all tests](#testing) are passed.
- Document it in [site documentation](./docs/web/docs/) and [CHANGELOG.md](./CHANGELOG.md).

[A simple example of adding a new polyfill.](https://github.com/zloirock/core-js/pull/1294/files)

## How to update `core-js-compat` data

For updating `core-js-compat` data:

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
`phantom`         | browser runner   | `safari`                   |                  |
`quest`           | browser runner   | `chrome-android`           |                  | required
`react-native`    | hermes runner    | `hermes`                   | required         |
`rhino`           | rhino runner     |                            | required         |
`safari`          | browser runner   |                            | required         |
`samsung`         | browser runner   | `chrome-android`           |                  | required

If you have no access to all required browsers / versions of browsers, use [Sauce Labs](https://saucelabs.com/), [BrowserStack](https://www.browserstack.com/) or [Cloud Browser](https://ieonchrome.com/).

## Style and standards

The coding style should follow our [`eslint.config.js`](./tests/eslint/eslint.config.js). You can test it by calling [`npm run lint`](#testing). Different places have different syntax and standard library limitations:
- Polyfill implementations should use only ES3 syntax and standard library, they should not use other polyfills from the global scope.
- Unit tests should use the modern syntax with our [minimalistic Babel config](./babel.config.js). Unit tests for the pure version should not use any modern standard library features.
- Tools, scripts and tests, performed in NodeJS, should use only the syntax and the standard library available in NodeJS 8.

File names should be in the kebab-case. Name of polyfill modules should follow the naming convention `namespace.subnamespace-where-required.feature-name`, for example, `esnext.set.intersection`. The top-level namespace should be `es` for stable ECMAScript features, `esnext` for ECMAScript proposals and `web` for other web standards.

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
- Linting:
  ```sh
  npm run lint
  ```
- Unit test case in Karma (modern Chromium, Firefox, WebKit (Playwright), ancient WebKit (PhantomJS), IE11 (if available)):
  ```sh
  npx run-s prepare bundle test-unit-karma
  ```
- Unit test case in NodeJS:
  ```sh
  npx run-s prepare bundle test-unit-node
  ```
- Unit test case in Bun:
  ```sh
  npx run-s prepare bundle test-unit-bun
  ```
- [Test262](https://github.com/tc39/test262) test case (it's not included to the default tests):
  ```sh
  npx run-s prepare bundle-package test262
  ```
- [Promises/A+](https://github.com/promises-aplus/promises-tests) and [ES6 `Promise`](https://github.com/promises-es6/promises-es6) test cases:
  ```sh
  npx run-s prepare test-promises
  ```
- [ECMAScript `Observable` test case](https://github.com/tc39/proposal-observable):
  ```sh
  npx run-s prepare test-observables
  ```
- CommonJS entry points tests:
  ```sh
  npx run-s prepare test-entries
  ```
- `core-js-compat` tools tests:
  ```sh
  npx run-s prepare test-compat-tools
  ```
- `core-js-builder` tests:
  ```sh
  npx run-s prepare test-builder
  ```
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
