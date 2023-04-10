---
category: feature
tag:
  - es-proposal
---

# [`ArrayBuffer.prototype.transfer` 和相关的](https://github.com/tc39/proposal-arraybuffer-transfer)

:::note
`ArrayBuffer.prototype.{ transfer, transferToFixedLength }` 只在原生支持 `ArrayBuffer` 的 `structuredClone` 转换运行时中被 polyfill。
:::

## 模块

- [`esnext.array-buffer.detached`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array-buffer.detached.js)
- [`esnext.array-buffer.transfer`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array-buffer.transfer.js)
- [`esnext.array-buffer.transfer-to-fixed-length`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array-buffer.transfer-to-fixed-length.js)

## 类型

```js
interface ArrayBuffer {
  get detached(): boolean;
  transfer(newLength?: number): ArrayBuffer;
  transferToFixedLength(newLength?: number): ArrayBuffer;
}
```

## 入口点

```
core-js/proposals/array-buffer-transfer
core-js/actual|full/array-buffer
core-js/actual|full/array-buffer/detached
core-js/actual|full/array-buffer/transfer
core-js/actual|full/array-buffer/transfer-to-fixed-length
```

## 示例

[_示例_](https://tinyurl.com/2y99jj9k):

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
