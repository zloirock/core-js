---
category: feature
tag:
  - web-standard
---

# Base64 utility methods

[Specification](https://html.spec.whatwg.org/multipage/webappapis.html#atob), [MDN](https://developer.mozilla.org/en-US/docs/Glossary/Base64).

## Modules

- [`web.atob`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.atob.js)
- [`web.btoa`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.btoa.js)

## Types

```ts
function atob(data: string): string;
function btoa(data: string): string;
```

## Entry points

```
core-js(-pure)/stable|actual|full/atob
core-js(-pure)/stable|actual|full/btoa
```

## Example

[_Example_](https://is.gd/4Nxmzn):

```js
btoa("hi, core-js"); // => 'aGksIGNvcmUtanM='
atob("aGksIGNvcmUtanM="); // => 'hi, core-js'
```
