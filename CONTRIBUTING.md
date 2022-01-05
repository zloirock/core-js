# Contributing

Contributions are always welcome. If you don't know how you can help, you can check [issues](https://github.com/zloirock/core-js/issues) or ask @zloirock.

## How to add a new polyfill

- The polyfill implementation should be added to the [`packages/core-js/modules`](./packages/core-js/modules) directory.
- Any shared helpers should be added to the [`packages/core-js/internals`](./packages/core-js/internals) directory.
- If the implementation for the `pure` version should significantly differ from the global version, add it to [`packages/core-js-pure/override`](./packages/core-js-pure/override) directory. The rest parts of `core-js-pure` will be copied from `core-js` package.
- For export the polyfill, in all common cases use `internals/export` helper. Use something else only if this helper is not applicable - for example, if you wanna polyfill accessors.
- Add the feature detection of the polyfill to [`tests/compat/tests.js`](./tests/compat/tests.js), add the compatibility data to [`packages/core-js-compat/src/data.mjs`](./packages/core-js-compat/src/data.mjs) and the name of the polyfill module to [`packages/core-js-compat/src/modules-by-versions.mjs`](./packages/core-js-compat/src/modules-by-versions.mjs) (this data also used for getting the default list of polyfills at bundling).
- Add it to entry points where it's required: directories [`packages/core-js/es`](./packages/core-js/es), [`packages/core-js/stable`](./packages/core-js/stable), [`packages/core-js/actual`](./packages/core-js/actual), [`packages/core-js/features`](./packages/core-js/features), [`packages/core-js/proposals`](./packages/core-js/proposals), [`packages/core-js/stage`](./packages/core-js/stage) and [`packages/core-js/web`](./packages/core-js/web).
- Add unit tests to [`tests/tests`](./tests/tests) and [`tests/pure`](./tests/pure).
- Add tests of entry points to [`tests/commonjs.js`](./tests/commonjs.js).
- Add documentation to [README.md](./README.md).

## How to update `core-js-compat` data

For updating `core-js-compat` data:

- If you want to add new data for a browser, run in this browser `tests/compat/index.html` and you will see what `core-js` modules are required for this browser.
- If you want to add new data for NodeJS, run `tests/compat/node-runner.js` in the required NodeJS version and you will see the results in the console.
- After getting this data, add it to [`packages/core-js-compat/src/data.mjs`](./packages/core-js-compat/src/data.mjs).
- If you want to add new mapping (for example, to add a new iOS Safari version based on Safari or NodeJS based on Chrome), add it to [`packages/core-js-compat/src/mapping.mjs`](./packages/core-js-compat/src/mapping.mjs).

## Style and standards

The coding style should follow our [`.eslintrc`](./.eslintrc.js). You can test it by calling [`npm run lint`](#testing). Different places have different syntax and standard library limitations:
- Polyfill implementations should use only ES3 syntax and standard library. Polyfills should not use another polyfill from the global namespace.
- Unit tests should use modern syntax with our [minimalistic Babel config](./babel.config.js). Unit tests for the `pure` version should not use any modern standard library features.
- Building tools and tests, performed in NodeJS, should use only syntax and standard library available in NodeJS 8.

File names should be in the kebab-case. Name of polyfill modules should follow the naming convention `namespace.subnamespace-where-required.feature-name`, for example, `esnext.promise.try`. The top-level namespace should be `es` for stable ECMAScript features, `esnext` for ECMAScript proposals and `web` for other web standards.

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
