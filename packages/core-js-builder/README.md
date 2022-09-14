![logo](https://user-images.githubusercontent.com/2213682/146607186-8e13ddef-26a4-4ebf-befd-5aac9d77c090.png)

<div align="center">

[![fundraising](https://opencollective.com/core-js/all/badge.svg?label=fundraising)](https://opencollective.com/core-js) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/zloirock/core-js/blob/master/CONTRIBUTING.md) [![version](https://img.shields.io/npm/v/core-js-builder.svg)](https://www.npmjs.com/package/core-js-builder) [![tests](https://github.com/zloirock/core-js/workflows/tests/badge.svg)](https://github.com/zloirock/core-js/actions) [![eslint](https://github.com/zloirock/core-js/workflows/eslint/badge.svg)](https://github.com/zloirock/core-js/actions)

</div>

For some cases could be useful to exclude some `core-js` features or generate a polyfill for target engines. This API helps conditionally include or exclude certain parts of [`core-js`](https://github.com/zloirock/core-js) and build for targets. `modules`, `exclude` and `targets` options are specified in [the `core-js-compat` format](https://github.com/zloirock/core-js/tree/master/packages/core-js-compat).

```js
import builder from 'core-js-builder';

const bundle = await builder({
  modules: ['core-js/actual', 'esnext.reflect'],     // entries / modules / namespaces, by default - all `core-js` modules
  exclude: [/^es\.math\./, 'es.number.constructor'], // a blacklist of entries / modules / namespaces, by default - empty list
  targets: '> 0.5%, not dead, ie 9-11',              // optional browserslist or core-js-compat format query
  summary: {                                         // shows summary for the bundle, disabled by default:
    console: { size: true, modules: false },         // in the console, you could specify required parts or set `true` for enable all of them
    comment: { size: false, modules: true },         // in the comment in the target file, similarly to `summary.console`
  },
  filename: PATH_TO_MY_COREJS_BUNDLE,                // optional target filename, if it's missed a file will not be created
});
```
