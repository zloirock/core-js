// isolated `ArrayBuffer.prototype.resize` on a resizable `new ArrayBuffer` instance
new ArrayBuffer(8, {
  maxByteLength: 1024
}).resize(16);