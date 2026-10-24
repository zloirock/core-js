# structuredClone
[Specification](https://html.spec.whatwg.org/multipage/structured-data.html#dom-structuredclone)

## Modules
[`web.structured-clone`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.structured-clone.js).

## Built-ins signatures
```ts
function structuredClone(value: Serializable, { transfer?: Sequence<Transferable> }?): any;
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
{ core-js, @core-js/pure }/stable|actual|full/structured-clone
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/web/structured-clone`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/web/structured-clone.d.ts)

## Examples
```js
const structured = [{ a: 42 }];
const sclone = structuredClone(structured);
sclone;                      // => [{ a: 42 }]
structured !== sclone;       // => true
structured[0] !== sclone[0]; // => true

const circular = {};
circular.circular = circular;
const cclone = structuredClone(circular);
cclone.circular === cclone;  // => true

structuredClone(42);                                            // => 42
structuredClone({ x: 42 });                                     // => { x: 42 }
structuredClone([1, 2, 3]);                                     // => [1, 2, 3]
structuredClone(new Set([1, 2, 3]));                            // => Set { 1, 2, 3 }
structuredClone(new Map([['a', 1], ['b', 2]]));                 // => Map { 'a' => 1, 'b' => 2 }
structuredClone(new Int8Array([1, 2, 3]));                      // => new Int8Array([1, 2, 3])
structuredClone(new AggregateError([1, 2, 3], 'message'));      // => new AggregateError([1, 2, 3], 'message')
structuredClone(new TypeError('message', { cause: 42 }));       // => new TypeError('message', { cause: 42 })
structuredClone(new DOMException('message', 'DataCloneError')); // => new DOMException('message', 'DataCloneError')
structuredClone(document.getElementById('myfileinput').files);  // => new FileList
structuredClone(new Date(0));                                   // => new Date(0)
structuredClone(new Blob(['test']));                            // => new Blob(['test'])
structuredClone(new ImageData(8, 8));                           // => new ImageData(8, 8)
// etc.

structuredClone(new WeakMap()); // => DataCloneError on non-serializable types
```
> [!WARNING]
> - Many platform types cannot be transferred in most engines since we have no way to polyfill this behavior, however, the `transfer` option works for some platform types. I recommend avoiding this option.
> - Some specific platform types can't be cloned in old engines. Mostly these are very specific types or very old engines, but there are some exceptions. For example, we have no sync way to clone `ImageBitmap` in Safari 14.0- or Firefox 93-, so it's recommended to look at the [polyfill source](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.structured-clone.js) if you want to clone something specific.
> - Cloning views of resizable `ArrayBuffer`s or growable `SharedArrayBuffer`s requires native structured cloning support to preserve their length-tracking behavior.
> - When native cloning cannot preserve shared memory, as in Safari 17, cloned views reuse the original `SharedArrayBuffer` object. Their shared memory and length-tracking behavior are preserved, but the buffer does not get a new wrapper.
