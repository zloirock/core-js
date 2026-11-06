# DOMException
[Specification](https://webidl.spec.whatwg.org/#idl-DOMException)

## Modules
[`web.dom-exception.constructor`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.dom-exception.constructor.js), [`web.dom-exception.stack`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.dom-exception.stack.js), [`web.dom-exception.to-string-tag`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.dom-exception.to-string-tag.js).

## Built-ins signatures
```ts
class DOMException {
  constructor(message?: string, name?: string);
  readonly attribute name: string;
  readonly attribute message: string;
  readonly attribute code: number;
  attribute stack: string; // in engines that should have it
  @@toStringTag: 'DOMException';
  // legacy error codes, the same constants are also on the prototype
  static INDEX_SIZE_ERR: 1;
  static DOMSTRING_SIZE_ERR: 2;
  static HIERARCHY_REQUEST_ERR: 3;
  static WRONG_DOCUMENT_ERR: 4;
  static INVALID_CHARACTER_ERR: 5;
  static NO_DATA_ALLOWED_ERR: 6;
  static NO_MODIFICATION_ALLOWED_ERR: 7;
  static NOT_FOUND_ERR: 8;
  static NOT_SUPPORTED_ERR: 9;
  static INUSE_ATTRIBUTE_ERR: 10;
  static INVALID_STATE_ERR: 11;
  static SYNTAX_ERR: 12;
  static INVALID_MODIFICATION_ERR: 13;
  static NAMESPACE_ERR: 14;
  static INVALID_ACCESS_ERR: 15;
  static VALIDATION_ERR: 16;
  static TYPE_MISMATCH_ERR: 17;
  static SECURITY_ERR: 18;
  static NETWORK_ERR: 19;
  static ABORT_ERR: 20;
  static URL_MISMATCH_ERR: 21;
  static QUOTA_EXCEEDED_ERR: 22;
  static TIMEOUT_ERR: 23;
  static INVALID_NODE_TYPE_ERR: 24;
  static DATA_CLONE_ERR: 25;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
{ core-js, @core-js/pure }/stable|actual|full/dom-exception
{ core-js, @core-js/pure }/stable|actual|full/dom-exception/constructor
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/web/dom-exception`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/web/dom-exception.d.ts)

## Examples
```js
const exception = new DOMException('error', 'DataCloneError');
exception.name;                            // => 'DataCloneError'
exception.message;                         // => 'error'
exception.code;                            // => 25
typeof exception.stack;                    // => 'string'
exception instanceof DOMException;         // => true
exception instanceof Error;                // => true
exception.toString();                      // => 'DataCloneError: error'
Object.prototype.toString.call(exception); // => '[object DOMException]'
```
