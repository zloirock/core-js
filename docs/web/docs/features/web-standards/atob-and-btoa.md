# `atob` and `btoa`
[Specification](https://html.spec.whatwg.org/multipage/webappapis.html#dom-atob-dev)

## Modules
[`web.atob`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.atob.js), [`web.btoa`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.btoa.js)

## Built-ins signatures
```ts
function btoa(data: string): string;
function atob(data: string): string;
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js(-pure)/stable|actual|full/atob
core-js(-pure)/stable|actual|full/btoa
```

## Examples
```js
const text = "Hello, World!";
const encoded = btoa(text);
console.log(encoded);            // => "SGVsbG8sIFdvcmxkIQ=="
console.log(atob(encoded));      // => "Hello, World!"

btoa("");                        // => ""
atob("");                        // => ""
```
