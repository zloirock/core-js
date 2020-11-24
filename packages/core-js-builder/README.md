For some cases could be useful adding a _exclude_ list of features or generation a polyfill for target engines. This API helps conditionally include or exclude certain parts of [`core-js`](https://github.com/zloirock/core-js), use `browserslist` queries from [`core-js-compat`](https://github.com/zloirock/core-js/tree/master/packages/core-js-compat) package.

> **NOTE:**
> `blacklist` parameter is now deprecated in favor of `exclude`. And will be removed in the next major version. You can't use both parameters since `blacklist` has precedence.

```js
require('core-js-builder')({
  modules: ['es', 'esnext.reflect', 'web'],         // modules / namespaces, by default - all `core-js` modules
  exclude: ['es.math', 'es.number.constructor'],    // exclude of modules / namespaces, by default - empty list
  targets: '> 0.5%',                                // optional browserslist query
  filename: './my-core-js-bundle.js',               // optional target filename, if it's missed a file will not be created
}).then(code => {                                   // code of result polyfill
  // ...
}).catch(error => {
  // ...
});
```
