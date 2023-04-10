---
category: feature
tag:
  - web-standard
---

# `DOMException`

[The specification.](https://webidl.spec.whatwg.org/#idl-DOMException)

## Modules

- [`web.dom-exception.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.dom-exception.constructor.js)
- [`web.dom-exception.stack`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.dom-exception.stack.js)
- [`web.dom-exception.to-string-tag`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.dom-exception.to-string-tag.js)

## Types

```ts
class DOMException {
  constructor(message: string, name?: string);
  readonly name: string;
  readonly message: string;
  readonly code: string;
  stack: string; // in engines that should have it
  [Symbol.toStringTag]: "DOMException";
}
```

## Entry points

```
core-js(-pure)/stable|actual|full/dom-exception
core-js(-pure)/stable|actual|full/dom-exception/constructor
core-js/stable|actual|full/dom-exception/to-string-tag
```

# Example

[_Example_](https://is.gd/pI6oTN):

```js
const exception = new DOMException("error", "DataCloneError");
console.log(exception.name); // => 'DataCloneError'
console.log(exception.message); // => 'error'
console.log(exception.code); // => 25
console.log(typeof exception.stack); // => 'string'
console.log(exception instanceof DOMException); // => true
console.log(exception instanceof Error); // => true
console.log(exception.toString()); // => 'DataCloneError: error'
console.log(Object.prototype.toString.call(exception)); // => '[object DOMException]'
```
