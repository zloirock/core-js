# DOMException
[Specification](https://webidl.spec.whatwg.org/#idl-DOMException)

## Modules 
[`web.dom-exception.constructor`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.dom-exception.constructor.js), [`web.dom-exception.stack`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.dom-exception.stack.js), [`web.dom-exception.to-string-tag`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.dom-exception.to-string-tag.js).

## Built-ins signatures
```ts
class DOMException {
  constructor(message: string, name?: string);
  readonly attribute name: string;
  readonly attribute message: string;
  readonly attribute code: string;
  attribute stack: string; // in engines that should have it
  @@toStringTag: 'DOMException';
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js(-pure)/stable|actual|full/dom-exception
core-js(-pure)/stable|actual|full/dom-exception/constructor
```

## Examples
```js
const exception = new DOMException('error', 'DataCloneError');
console.log(exception.name);                            // => 'DataCloneError'
console.log(exception.message);                         // => 'error'
console.log(exception.code);                            // => 25
console.log(typeof exception.stack);                    // => 'string'
console.log(exception instanceof DOMException);         // => true
console.log(exception instanceof Error);                // => true
console.log(exception.toString());                      // => 'DataCloneError: error'
console.log(Object.prototype.toString.call(exception)); // => '[object DOMException]'
```
