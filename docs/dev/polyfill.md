---
category: development
icon: code
---

# Add a new polyfill

- The polyfill implementation should be added to the [`packages/core-js/modules`](./packages/core-js/modules) directory.
- Shared helpers should be added to the [`packages/core-js/internals`](./packages/core-js/internals) directory. Reuse already existing helpers.
- For export the polyfill, in all common cases use `internals/export` helper. Use something else only if this helper is not applicable - for example, if you want to polyfill accessors.
- If the code of the pure version implementation should significantly differ from the global version (_that's not a frequent situation, in most cases `internals/is-pure` is enough_), you can add it to [`packages/core-js-pure/override`](./packages/core-js-pure/override) directory. The rest parts of `core-js-pure` will be copied from `core-js` package.
- Add the feature detection of the polyfill to [`tests/compat/tests.js`](https://github.com/zloirock/core-js/blob/master/tests/compat/tests.js), add the compatibility data to [`packages/core-js-compat/src/data.mjs`](https://github.com/zloirock/core-js/blob/master/packages/core-js-compat/src/data.mjs), how to do it [see here](./compat.md), and the name of the polyfill module to [`packages/core-js-compat/src/modules-by-versions.mjs`](https://github.com/zloirock/core-js/blob/master/packages/core-js-compat/src/modules-by-versions.mjs) (this data is also used for getting the default list of polyfills at bundling and generation indexes).
- Add it to entry points of those directories where it's required:
  - [`packages/core-js/es`](https://github.com/zloirock/core-js/blob/master/packages/core-js/es)
  - [`packages/core-js/stable`](https://github.com/zloirock/core-js/blob/master/packages/core-js/stable)
  - [`packages/core-js/actual`](https://github.com/zloirock/core-js/blob/master/packages/core-js/actual)
  - [`packages/core-js/full`](https://github.com/zloirock/core-js/blob/master/packages/core-js/full)
  - [`packages/core-js/proposals`](https://github.com/zloirock/core-js/blob/master/packages/core-js/proposals)
  - [`packages/core-js/stage`](https://github.com/zloirock/core-js/blob/master/packages/core-js/stage)
  - [`packages/core-js/web`](https://github.com/zloirock/core-js/blob/master/packages/core-js/web).
- Add unit tests to [`tests/unit-global`](https://github.com/zloirock/core-js/blob/master/tests/unit-global) and [`tests/unit-pure`](https://github.com/zloirock/core-js/blob/master/tests/unit-pure).
- Add tests of entry points to [`tests/entries/unit.mjs`](https://github.com/zloirock/core-js/blob/master/tests/entries/unit.mjs).
- Make sure that you are following [our coding style](#style-and-standards).
- Document it in [README.md](https://github.com/zloirock/core-js/blob/master/README.md), [CHANGELOG.md](https://github.com/zloirock/core-js/blob/master/CHANGELOG.md) and [docs](./docs/polyfill.md)

## Style and standards

The coding style should follow our [ESlint configuration](https://github.com/zloirock/core-js/blob/master/tests/eslint/eslint.config.js). You can test it by calling [`npm run lint`](./testing.md). Different places have different syntax and standard library limitations:

- Polyfill implementations should use only ES3 syntax and standard library, they should not use other polyfills from the global scope.
- Unit tests should use the modern syntax with our [minimalistic Babel config](https://github.com/zloirock/core-js/blob/master/babel.config.js). Unit tests for the pure version should not use any modern standard library features.
- Tools, scripts and tests, performed in NodeJS, should use only the syntax and the standard library available in NodeJS 8.

File names should be in the kebab-case. Name of polyfill modules should follow the naming convention `namespace.subnamespace-where-required.feature-name`, for example, `esnext.set.intersection`. The top-level namespace should be `es` for stable ECMAScript features, `esnext` for ECMAScript proposals and `web` for other web standards.
