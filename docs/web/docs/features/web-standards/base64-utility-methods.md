# Base64 utility methods
[Specification](https://html.spec.whatwg.org/multipage/webappapis.html#atob)\
[MDN](https://developer.mozilla.org/en-US/docs/Glossary/Base64)

## Modules 
[`web.atob`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.atob.js), [`web.btoa`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.btoa.js).

## Built-ins signatures
```ts
function atob(data: string): string;
function btoa(data: string): string;
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js(-pure)/stable|actual|full/atob
core-js(-pure)/stable|actual|full/btoa
```

## Examples
```js
btoa('hi, core-js');      // => 'aGksIGNvcmUtanM='
atob('aGksIGNvcmUtanM='); // => 'hi, core-js'
```
