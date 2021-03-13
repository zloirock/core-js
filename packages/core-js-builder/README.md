For some cases could be useful to exclude some `core-js` features or generate a polyfill for target engines. This API helps conditionally include or exclude certain parts of [`core-js`](https://github.com/zloirock/core-js), build for targets [specified in `@core-js/compat` format](https://github.com/zloirock/core-js/tree/master/packages/core-js-compat#targets-option).

```js
const builder = require('core-js-builder');

const bundle = await builder({
  modules: ['es', 'esnext.reflect', 'web'],      // modules / namespaces, by default - all `core-js` modules
  exclude: ['es.math', 'es.number.constructor'], // a blacklist of modules / namespaces, by default - empty list
  targets: '> 0.5%, not dead, ie 9-11',          // optional browserslist or core-js-compat format query
  summary: {                                     // shows summary for the bundle, disabled by default:
    console: { size: true, modules: false },     // in the console, you could specify required parts or set `true` for enable all of them
    comment: { size: false, modules: true },     // in the comment in the target file, similarly to `summary.console`
  },
  filename: './my-core-js-bundle.js',            // optional target filename, if it's missed a file will not be created
});
```
