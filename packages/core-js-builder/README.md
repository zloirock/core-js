For some cases could be useful adding a blacklist of features or generation a polyfill for target engines. This API helps conditionally include or exclude certain parts of [`core-js`](https://github.com/zloirock/core-js), use `browserslist` queries from [`core-js-compat`](https://github.com/zloirock/core-js/packages/core-js-compat) package.

```js
require('core-js-builder')({
  modules: ['es', 'esnext.reflect', 'web'],        // modules / namespaces, by default - all `core-js` modules
  blacklist: ['es.math', 'es.number.constructor'], // blacklist of modules / namespaces, by default - empty list
  targets: '> 0.5%',                               // optional browserslist query
}).then(code => {
  // ...
}).catch(error => {
  // ...
});
```
