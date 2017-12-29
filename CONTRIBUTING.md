# Contributing

Contributions are always welcome. If you don't know what how you can help, you can check [issues](https://github.com/zloirock/core-js/issues) or ask @zloirock.

## How to add a new polyfill

- The polyfill implementation should be added to the [`modules`](./tree/v3/modules) directory.
- If the ponyfill implementation should differ from the global version, it should be added to [`modules/ponyfill`](./tree/v3/modules/ponyfill) directory.
- For export the polyfill, in almost all cases should be used `_export` helper.
- The polyfill should be added to the [list of polyfills](./tree/v3/build/config.js) and to entry points, where it's required: [`index.js`](./index.js), directories [`fn`](./tree/v3/fn), [`es`](./tree/v3/es), [`esnext`](./tree/v3/esnext) and [`web`](./tree/v3/web).
- Unit tests for the polyfill should be added to [`tests/tests`](./tree/v3/tests/tests) and [`tests/ponyfill`](./tree/v3/tests/ponyfill).
- All new entry points should be added to [the test of entry points](./tree/v3/tests/commonjs).
- Add it to [README.md](./README.md).

## Style and standards

Coding style should follow our [`.eslintrc`](./.eslintrc.js). Different places have different syntax and standard library limitations:
- Polyfill implementations should use only ES3 syntax and standard library. Polyfills should not use another polyfill from the global namespace.
- In unit tests should be used modern syntax with our [minimalistic Babel config](./.babelrc). Unit tests for ponyfills should not use any modern standard library features.
- In building tools and tests, performed in Node.js, should be used only available in Node.js 4 syntax and standard library.

File names should be in kebab-case. Name of files with polyfills should follow naming convention `namespace.subnamespase-where-required.feature-name`, for example, `esnext.promise.try`. Top level namespace could be `es` for stable ECMAScript features, `esnext` for ECMAScript proposals, `web` for another web standards and `core` for helpers. Internal `core-js` modules should use `_` prefix.
