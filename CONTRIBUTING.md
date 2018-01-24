# Contributing

Contributions are always welcome. If you don't know what how you can help, you can check [issues](https://github.com/zloirock/core-js/issues) or ask @zloirock.

## How to add a new polyfill

- The polyfill implementation should be added to the [`packages/core-js/modules`](./packages/core-js/modules) directory.
- If the implementation for the `pure` version should differ from the global version, it should be added to [`packages/core-js-pure/modules-pure`](./packages/core-js-pure/modules-pure) directory.
- For export the polyfill, in almost all cases should be used `_export` helper.
- The polyfill should be added to the [list of polyfills](./packages/core-js-builder/config.js) and to entry points, where it's required: [`packages/core-js/index.js`](./packages/core-js/index.js), directories [`packages/core-js/fn`](./packages/core-js/fn), [`packages/core-js/es`](./packages/core-js/es), [`packages/core-js/esnext`](./packages/core-js/esnext) and [`packages/core-js/web`](./packages/core-js/web).
- Unit tests for the polyfill should be added to [`tests/tests`](./tests/tests) and [`tests/pure`](./tests/pure).
- All new entry points should be added to [the test of entry points](./tests/commonjs).
- Add it to [README.md](./README.md).

## Style and standards

Coding style should follow our [`.eslintrc`](./.eslintrc.js). You can test it by calling [`npm run eslint`](#testing). Different places have different syntax and standard library limitations:
- Polyfill implementations should use only ES3 syntax and standard library. Polyfills should not use another polyfill from the global namespace.
- In unit tests should be used modern syntax with our [minimalistic Babel config](./.babelrc). Unit tests for the `pure` version should not use any modern standard library features.
- In building tools and tests, performed in Node.js, should be used only available in Node.js 4 syntax and standard library.

File names should be in kebab-case. Name of files with polyfills should follow naming convention `namespace.subnamespase-where-required.feature-name`, for example, `esnext.promise.try`. Top level namespace could be `es` for stable ECMAScript features, `esnext` for ECMAScript proposals, `web` for another web standards and `core` for helpers. Internal `core-js` modules should use `_` prefix.

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
- Global version unit tests:
```
$ npm run unit-tests
```
- `pure` version unit tests:
```
$ npm run unit-tests-pure
```
- [Promises/A+ test case](https://github.com/promises-aplus/promises-tests):
```
$ npm run promises-tests
```
- [ECMAScript `Observable` test case](https://github.com/tc39/proposal-observable):
```
$ npm run observables-tests
```
- CommonJS entry points tests:
```
$ npm run commonjs-tests
```
If you want to run tests in a certain browser at first you should build packages and test bundles:
```
$ npm run build
```
- For running global version unit test case use this file:
```
tests/tests.html
```
- For running the `pure` version unit test case use this file:
```
tests/pure.html
```
- Before running [Promises/A+ test case](https://github.com/promises-aplus/promises-tests) in the browser you should bundle it:
```
$ npm run bundle-promises-tests
```
and after that use this file:
```
tests/promises-aplus.html
```
