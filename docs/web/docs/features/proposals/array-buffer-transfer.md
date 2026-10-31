# `ArrayBuffer.prototype.transfer` and friends
[Specification](https://tc39.es/proposal-arraybuffer-transfer/)\
[Proposal repo](https://github.com/tc39/proposal-arraybuffer-transfer)

## Modules
[`es.array-buffer.detached`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array-buffer.detached.js), [`es.array-buffer.transfer`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array-buffer.transfer.js) and [`es.array-buffer.transfer-to-fixed-length`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array-buffer.transfer-to-fixed-length.js).

## Built-ins signatures
```ts
class ArrayBuffer {
  readonly attribute detached: boolean;
  transfer(newLength?: number): ArrayBuffer;
  transferToFixedLength(newLength?: number): ArrayBuffer;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/array-buffer-transfer
core-js/es|stable|actual|full/array-buffer/detached
core-js/es|stable|actual|full/array-buffer/transfer
core-js/es|stable|actual|full/array-buffer/transfer-to-fixed-length
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/array-buffer-transfer`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/array-buffer-transfer.d.ts)

## Examples
```js
const buffer = Int8Array.of(1, 2, 3, 4, 5, 6, 7, 8).buffer;
buffer.byteLength; // => 8
buffer.detached; // => false
const newBuffer = buffer.transfer(4);
buffer.byteLength; // => 0
buffer.detached; // => true
newBuffer.byteLength; // => 4
newBuffer.detached; // => false
[...new Int8Array(newBuffer)]; // => [1, 2, 3, 4]
```
