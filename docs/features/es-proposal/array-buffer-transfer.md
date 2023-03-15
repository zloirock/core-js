---
category: feature
tag:
  - es-proposal
---

# [`ArrayBuffer.prototype.transfer` and friends](https://github.com/tc39/proposal-arraybuffer-transfer)

:::note
`ArrayBuffer.prototype.{ transfer, transferToFixedLength }` polyfilled only in runtime with native `structuredClone` with `ArrayBuffer` transfer support.
:::

## Modules

- [`esnext.array-buffer.detached`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array-buffer.detached.js)
- [`esnext.array-buffer.transfer`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array-buffer.transfer.js)
- [`esnext.array-buffer.transfer-to-fixed-length`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array-buffer.transfer-to-fixed-length.js)

## Types

```js
interface ArrayBuffer {
  get detached(): boolean;
  transfer(newLength?: number): ArrayBuffer;
  transferToFixedLength(newLength?: number): ArrayBuffer;
}
```

## Entry points

```
core-js/proposals/array-buffer-transfer
core-js/actual|full/array-buffer
core-js/actual|full/array-buffer/detached
core-js/actual|full/array-buffer/transfer
core-js/actual|full/array-buffer/transfer-to-fixed-length
```

## Example

[_Example_](https://tinyurl.com/2y99jj9k):

```js
const buffer = Int8Array.of(1, 2, 3, 4, 5, 6, 7, 8).buffer;
console.log(buffer.byteLength); // => 8
console.log(buffer.detached); // => false
const newBuffer = buffer.transfer(4);
console.log(buffer.byteLength); // => 0
console.log(buffer.detached); // => true
console.log(newBuffer.byteLength); // => 4
console.log(newBuffer.detached); // => false
console.log([...new Int8Array(newBuffer)]); // => [1, 2, 3, 4]
```
