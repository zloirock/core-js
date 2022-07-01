# Contributing

Contributions are always welcome. If you don't know how you can help, you can check [issues](https://github.com/zloirock/core-js/issues) or ask [**@zloirock**](https://github.com/zloirock).

## How to add a new polyfill

- The polyfill implementation should be added to the [`packages/core-js/modules`](./packages/core-js/modules) directory.
- Shared helpers should be added to the [`packages/core-js/internals`](./packages/core-js/internals) directory. Reuse already existing helpers.
- For export the polyfill, in all common cases use `internals/export` helper. Use something else only if this helper is not applicable - for example, if you want to polyfill accessors.
- If the code of the pure version implementation should significantly differ from the global version (*that's not a frequent situation, in most cases `internals/is-pure` is enough*), you can add it to [`packages/core-js-pure/override`](./packages/core-js-pure/override) directory. The rest parts of `core-js-pure` will be copied from `core-js` package.
- Add the feature detection of the polyfill to [`tests/compat/tests.js`](./tests/compat/tests.js), add the compatibility data to [`packages/core-js-compat/src/data.mjs`](./packages/core-js-compat/src/data.mjs), how to do it [see below](#how-to-update-core-js-compat-data), and the name of the polyfill module to [`packages/core-js-compat/src/modules-by-versions.mjs`](./packages/core-js-compat/src/modules-by-versions.mjs) (this data is also used for getting the default list of polyfills at bundling and generation indexes).
- Add it to entry points where it's required: directories [`packages/core-js/es`](./packages/core-js/es), [`packages/core-js/stable`](./packages/core-js/stable), [`packages/core-js/actual`](./packages/core-js/actual), [`packages/core-js/full`](./packages/core-js/full), [`packages/core-js/proposals`](./packages/core-js/proposals), [`packages/core-js/stage`](./packages/core-js/stage) and [`packages/core-js/web`](./packages/core-js/web).
- Add unit tests to [`tests/tests`](./tests/tests) and [`tests/pure`](./tests/pure).
- Add tests of entry points to [`tests/commonjs.js`](./tests/commonjs.js).
- Make sure that you are following [our coding style](#style-and-standards) and [all tests](#testing) are passed.
- Document it in [README.md](./README.md) and [CHANGELOG.md](./CHANGELOG.md).

## How to update `core-js-compat` data

For updating `core-js-compat` data:

- If you want to add a new data for a browser, run in this browser `tests/compat/index.html` (tests and results for the actual release are available at [`http://zloirock.github.io/core-js/compat/`](http://zloirock.github.io/core-js/compat/)) and you will see what `core-js` modules are required for this browser.

![compat-table](https://user-images.githubusercontent.com/2213682/173199354-1f3aeb83-7231-46b2-8a14-a9d47ce3ae45.png)

- If you want to add new data for NodeJS, run `npm run compat-node` with the installed required NodeJS version and you will see the results in the console. Use `npm run compat-node-json` if you want to get the result as JSON.
- If you want to add new data for Deno, run `npm run compat-deno` with the installed required Deno version and you will see the results in the console. Use `npm run compat-deno-json` if you want to get the result as JSON.
- If you want to add new data for Rhino, set the required Rhino version in `compat-rhino-prepare` NPM script in [`package.json`](./package.json), run `npm run compat-rhino` and you will see the results in the console.
- After getting this data, add it to [`packages/core-js-compat/src/data.mjs`](./packages/core-js-compat/src/data.mjs).
- If you want to add new mapping (for example, to add a new iOS Safari version based on Safari or NodeJS based on Chrome), add it to [`packages/core-js-compat/src/mapping.mjs`](./packages/core-js-compat/src/mapping.mjs).

engine         | mandatory check | how to run tests | base data inherits from      | mapping for a new version
---            | ---             | ---              | ---                          | ---
`android`      |                 | browser runner   | `chrome`                     |
`chrome`       | features        | browser runner   |                              |
`deno`         | non-ES features | deno runner      | `chrome` (only ES)           | required
`edge`         | features        | browser runner   | `ie` (<=18), `chrome` (>=74) |
`electron`     |                 | browser runner   | `chrome`                     | required
`firefox`      | features        | browser runner   |                              |
`ie`           | features        | browser runner   |                              |
`ios`          |                 | browser runner   | `safari`                     | required
`node`         | non-ES features | node runner      | `chrome` (only ES)           | required
`oculus`       |                 | browser runner   | `android`                    | required
`opera`        |                 | browser runner   | `chrome` (>12)               | in case of inconsistency
`opera_mobile` |                 | browser runner   | `opera`, `chrome`            | required
`phantom`      |                 | browser runner   | `safari`                     |
`rhino`        | features        | rhino runner     |                              |
`safari`       | features        | browser runner   |                              |
`samsung`      |                 | browser runner   | `chrome`                     | required

If you have no access to all required browsers / versions of browsers, use [Sauce Labs](https://saucelabs.com/), [BrowserStack](https://www.browserstack.com/) or [Cloud Browser](https://ieonchrome.com/).

## Style and standards

The coding style should follow our [`.eslintrc`](./.eslintrc.js). You can test it by calling [`npm run lint`](#testing). Different places have different syntax and standard library limitations:
- Polyfill implementations should use only ES3 syntax and standard library, they should not use other polyfills from the global scope.
- Unit tests should use the modern syntax with our [minimalistic Babel config](./babel.config.js). Unit tests for the pure version should not use any modern standard library features.
- Tools, scripts and tests, performed in NodeJS, should use only the syntax and the standard library available in NodeJS 8.

File names should be in the kebab-case. Name of polyfill modules should follow the naming convention `namespace.subnamespace-where-required.feature-name`, for example, `esnext.set.intersection`. The top-level namespace should be `es` for stable ECMAScript features, `esnext` for ECMAScript proposals and `web` for other web standards.

## Testing

Before testing, you should install dependencies:
```
$ npm i
```
You can run all tests by
```
$ npm run test
```
You can run parts of the test case separately:
- Linting:
  ```
  $ npm run lint
  ```
- The global version unit tests:
  ```
  $ npm run test-unit-global-standalone
  ```
- The pure version unit tests:
  ```
  $ npm run test-unit-pure-standalone
  ```
- [Promises/A+](https://github.com/promises-aplus/promises-tests) and [ES6 `Promise`](https://github.com/promises-es6/promises-es6) test cases:
  ```
  $ npm run test-promises-standalone
  ```
- [ECMAScript `Observable` test case](https://github.com/tc39/proposal-observable):
  ```
  $ npm run test-observables-standalone
  ```
- CommonJS entry points tests:
  ```
  $ npm run test-entries-standalone
  ```
- If you want to run tests in a certain browser, at first, you should build packages and test bundles:
  ```
  $ npm run bundle-standalone
  ```
- For running the global version of the unit test case, use this file:
  ```
  tests/tests.html
  ```
- For running the pure version of the unit test case, use this file:
  ```
  tests/pure.html
  ```
