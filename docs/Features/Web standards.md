# Index
- [`structuredClone`](#structuredclone)
- [Base64 utility methods](#base64-utility-methods)
- [`setTimeout` and `setInterval`](#settimeout-and-setinterval)
- [`setImmediate`](#setimmediate)
- [`queueMicrotask`](#queuemicrotask)
- [`URL` and `URLSearchParams`](#url-and-urlsearchparams)
- [`DOMException`](#domexception)
- [iterable DOM collections](#iterable-dom-collections)

## `structuredClone`[⬆](#index)
[Spec](https://html.spec.whatwg.org/multipage/structured-data.html#dom-structuredclone), module [`web.structured-clone`](../../packages/core-js/modules/web.structured-clone.js)
```js
function structuredClone(value: Serializable, { transfer?: Sequence<Transferable> }): any;
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
```js
core-js(-pure)/stable|actual|full/structured-clone
```
[*Examples*](https://is.gd/RhK7TW):
```js
const structured = [{ a: 42 }];
const sclone = structuredClone(structured);
console.log(sclone);                      // => [{ a: 42 }]
console.log(structured !== sclone);       // => true
console.log(structured[0] !== sclone[0]); // => true

const circular = {};
circular.circular = circular;
const cclone = structuredClone(circular);
console.log(cclone.circular === cclone);  // => true

structuredClone(42);                                            // => 42
structuredClone({ x: 42 });                                     // => { x: 42 }
structuredClone([1, 2, 3]);                                     // => [1, 2, 3]
structuredClone(new Set([1, 2, 3]));                            // => Set{ 1, 2, 3 }
structuredClone(new Map([['a', 1], ['b', 2]]));                 // => Map{ a: 1, b: 2 }
structuredClone(new Int8Array([1, 2, 3]));                      // => new Int8Array([1, 2, 3])
structuredClone(new AggregateError([1, 2, 3], 'message'));      // => new AggregateError([1, 2, 3], 'message'))
structuredClone(new TypeError('message', { cause: 42 }));       // => new TypeError('message', { cause: 42 })
structuredClone(new DOMException('message', 'DataCloneError')); // => new DOMException('message', 'DataCloneError')
structuredClone(document.getElementById('myfileinput'));        // => new FileList
structuredClone(new DOMPoint(1, 2, 3, 4));                      // => new DOMPoint(1, 2, 3, 4)
structuredClone(new Blob(['test']));                            // => new Blob(['test'])
structuredClone(new ImageData(8, 8));                           // => new ImageData(8, 8)
// etc.

structuredClone(new WeakMap()); // => DataCloneError on non-serializable types
```
### Caveats when using `structuredClone` polyfill:[⬆](#index)

* `ArrayBuffer` instances and many platform types cannot be transferred in most engines since we have no way to polyfill this behavior, however `.transfer` option works for some platform types. I recommend avoiding this option.
* Some specific platform types can't be cloned in old engines. Mainly it's very specific types or very old engines, but here are some exceptions. For example, we have no sync way to clone `ImageBitmap` in Safari 14.0- or Firefox 83-, so it's recommended to look to the [polyfill source](../../packages/core-js/modules/web.structured-clone.js) if you wanna clone something specific.

## Base64 utility methods[⬆](#index)
[Specification](https://html.spec.whatwg.org/multipage/webappapis.html#atob), [MDN](https://developer.mozilla.org/en-US/docs/Glossary/Base64). Modules [`web.atob`](../../packages/core-js/modules/web.atob.js), [`web.btoa`](../../packages/core-js/modules/web.btoa.js).
```js
function atob(data: string): string;
function btoa(data: string): string;
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js(-pure)/stable|actual|full/atob
core-js(-pure)/stable|actual|full/btoa
```
[*Examples*](https://is.gd/4Nxmzn):
```js
btoa('hi, core-js');      // => 'aGksIGNvcmUtanM='
atob('aGksIGNvcmUtanM='); // => 'hi, core-js'
```

## `setTimeout` and `setInterval`[⬆](#index)
Module [`web.timers`](../../packages/core-js/modules/web.timers.js). Additional arguments fix for IE9-.
```js
function setTimeout(callback: any, time: any, ...args: Array<mixed>): number;
function setInterval(callback: any, time: any, ...args: Array<mixed>): number;
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js(-pure)/stable|actual|full/set-timeout
core-js(-pure)/stable|actual|full/set-interval
```
```js
// Before:
setTimeout(log.bind(null, 42), 1000);
// After:
setTimeout(log, 1000, 42);
```
## `setImmediate`[⬆](#index)
Module [`web.immediate`](../../packages/core-js/modules/web.immediate.js). [`setImmediate`](https://w3c.github.io/setImmediate/) polyfill.
```js
function setImmediate(callback: any, ...args: Array<mixed>): number;
function clearImmediate(id: number): void;
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js(-pure)/stable|actual|full/set-immediate
core-js(-pure)/stable|actual|full/clear-immediate
```
[*Examples*](https://goo.gl/6nXGrx):
```js
setImmediate((arg1, arg2) => {
  console.log(arg1, arg2); // => Message will be displayed with minimum delay
}, 'Message will be displayed', 'with minimum delay');

clearImmediate(setImmediate(() => {
  console.log('Message will not be displayed');
}));
```

## `queueMicrotask`[⬆](#index)
[Spec](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-queuemicrotask), module [`web.queue-microtask`](../../packages/core-js/modules/web.queue-microtask.js)
```js
function queueMicrotask(fn: Function): void;
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js(-pure)/stable|actual|full/queue-microtask
```
[*Examples*](https://goo.gl/nsW8P9):
```js
queueMicrotask(() => console.log('called as microtask'));
```

## `URL` and `URLSearchParams`[⬆](#index)
[`URL` standard](https://url.spec.whatwg.org/) implementation. Modules [`web.url`](../../packages/core-js/modules/web.url.js), [`web.url.to-json`](../../packages/core-js/modules/web.url.to-json.js), [`web.url-search-params`](../../packages/core-js/modules/web.url-search-params.js).
```js
class URL {
  constructor(url: string, base?: string);
  attribute href: string;
  readonly attribute origin: string;
  attribute protocol: string;
  attribute username: string;
  attribute password: string;
  attribute host: string;
  attribute hostname: string;
  attribute port: string;
  attribute pathname: string;
  attribute search: string;
  readonly attribute searchParams: URLSearchParams;
  attribute hash: string;
  toJSON(): string;
  toString(): string;
}

class URLSearchParams {
  constructor(params?: string | Iterable<[key, value]> | Object);
  append(name: string, value: string): void;
  delete(name: string): void;
  get(name: string): string | void;
  getAll(name: string): Array<string>;
  has(name: string): boolean;
  set(name: string, value: string): void;
  sort(): void;
  toString(): string;
  forEach(callbackfn: (value: any, index: number, target: any) => void, thisArg: any): void;
  entries(): Iterator<[key, value]>;
  keys(): Iterator<key>;
  values(): Iterator<value>;
  @@iterator(): Iterator<[key, value]>;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js/proposals/url
core-js(-pure)/stable|actual|full/url
core-js/stable|actual|full/url/to-json
core-js(-pure)/stable|actual|full/url-search-params
```
[*Examples*](https://is.gd/AfIwve):
```js
const url = new URL('https://login:password@example.com:8080/foo/bar?a=1&b=2&a=3#fragment');

console.log(url.href);       // => 'https://login:password@example.com:8080/foo/bar?a=1&b=2&a=3#fragment'
console.log(url.origin);     // => 'https://example.com:8080'
console.log(url.protocol);   // => 'https:'
console.log(url.username);   // => 'login'
console.log(url.password);   // => 'password'
console.log(url.host);       // => 'example.com:8080'
console.log(url.hostname);   // => 'example.com'
console.log(url.port);       // => '8080'
console.log(url.pathname);   // => '/foo/bar'
console.log(url.search);     // => '?a=1&b=2&a=3'
console.log(url.hash);       // => '#fragment'
console.log(url.toJSON());   // => 'https://login:password@example.com:8080/foo/bar?a=1&b=2&a=3#fragment'
console.log(url.toString()); // => 'https://login:password@example.com:8080/foo/bar?a=1&b=2&a=3#fragment'

for (let [key, value] of url.searchParams) {
  console.log(key);   // => 'a', 'b', 'a'
  console.log(value); // => '1', '2', '3'
}

url.pathname = '';
url.searchParams.append('c', 4);

console.log(url.search); // => '?a=1&b=2&a=3&c=4'
console.log(url.href);   // => 'https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment'

const params = new URLSearchParams('?a=1&b=2&a=3');

params.append('c', 4);
params.append('a', 2);
params.sort();

for (let [key, value] of params) {
  console.log(key);   // => 'a', 'a', 'a', 'b', 'c'
  console.log(value); // => '1', '3', '2', '2', '4'
}

console.log(params.toString()); // => 'a=1&a=3&a=2&b=2&c=4'
```

### Caveats when using `URL` and `URLSearchParams`:[⬆](#index)
- IE8 does not support setters, so they do not work on `URL` instances. However, `URL` constructor can be used for basic `URL` parsing.
- Legacy encodings in a search query are not supported. Also, `core-js` implementation has some other encoding-related issues.
- `URL` implementations from all of the popular browsers have much more problems than `core-js`, however, replacing all of them does not looks like a good idea. You can customize the aggressiveness of polyfill [by your requirements](#configurable-level-of-aggressiveness).

### `DOMException`:[⬆](#index)
[The specification.](https://webidl.spec.whatwg.org/#idl-DOMException) Modules [`web.dom-exception.constructor`](../../packages/core-js/modules/web.dom-exception.constructor.js), [`web.dom-exception.stack`](../../packages/core-js/modules/web.dom-exception.stack.js), [`web.dom-exception.to-string-tag`](../../packages/core-js/modules/web.dom-exception.to-string-tag.js).
```js
class DOMException {
  constructor(message: string, name?: string);
  readonly attribute name: string;
  readonly attribute message: string;
  readonly attribute code: string;
  attribute stack: string; // in engines that should have it
  @@toStringTag: 'DOMException';
}
````
[*CommonJS entry points:*](#commonjs-api)
```js
core-js(-pure)/stable|actual|full/dom-exception
core-js(-pure)/stable|actual|full/dom-exception/constructor
core-js/stable|actual|full/dom-exception/to-string-tag
```
[*Examples*](https://is.gd/pI6oTN):
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

## Iterable DOM collections[⬆](#index)
Some DOM collections should have [iterable interface](https://heycam.github.io/webidl/#idl-iterable) or should be [inherited from `Array`](https://heycam.github.io/webidl/#LegacyArrayClass). That means they should have `forEach`, `keys`, `values`, `entries` and `@@iterator` methods for iteration. So add them. Modules [`web.dom-collections.iterator`](../../packages/core-js/modules/web.dom-collections.iterator.js) and [`web.dom-collections.for-each`](../../packages/core-js/modules/web.dom-collections.for-each.js).
```js
class [
  CSSRuleList,
  CSSStyleDeclaration,
  CSSValueList,
  ClientRectList,
  DOMRectList,
  DOMStringList,
  DataTransferItemList,
  FileList,
  HTMLAllCollection,
  HTMLCollection,
  HTMLFormElement,
  HTMLSelectElement,
  MediaList,
  MimeTypeArray,
  NamedNodeMap,
  PaintRequestList,
  Plugin,
  PluginArray,
  SVGLengthList,
  SVGNumberList,
  SVGPathSegList,
  SVGPointList,
  SVGStringList,
  SVGTransformList,
  SourceBufferList,
  StyleSheetList,
  TextTrackCueList,
  TextTrackList,
  TouchList,
] {
  @@iterator(): Iterator<value>;
}

class [DOMTokenList, NodeList] {
  forEach(callbackfn: (value: any, index: number, target: any) => void, thisArg: any): void;
  entries(): Iterator<[key, value]>;
  keys(): Iterator<key>;
  values(): Iterator<value>;
  @@iterator(): Iterator<value>;
}
```
[*CommonJS entry points:*](#commonjs-api)
```js
core-js(-pure)/stable|actual|full/dom-collections/iterator
core-js/stable|actual|full/dom-collections/for-each
```
[*Examples*](https://goo.gl/lfXVFl):
```js
for (let { id } of document.querySelectorAll('*')) {
  if (id) console.log(id);
}

for (let [index, { id }] of document.querySelectorAll('*').entries()) {
  if (id) console.log(index, id);
}

document.querySelectorAll('*').forEach(it => console.log(it.id));
```
