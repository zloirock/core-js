# Base64 utility methods
[Specification](https://html.spec.whatwg.org/multipage/webappapis.html#atob), [MDN](https://developer.mozilla.org/en-US/docs/Glossary/Base64). Modules [`web.atob`](/packages/core-js/modules/web.atob.js), [`web.btoa`](/packages/core-js/modules/web.btoa.js).
```js
function atob(data: string): string;
function btoa(data: string): string;
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
```js
core-js(-pure)/stable|actual|full/atob
core-js(-pure)/stable|actual|full/btoa
```
[*Examples*](https://is.gd/4Nxmzn):
```js
btoa('hi, core-js');      // => 'aGksIGNvcmUtanM='
atob('aGksIGNvcmUtanM='); // => 'hi, core-js'
```