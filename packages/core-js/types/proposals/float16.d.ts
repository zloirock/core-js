// proposal stage: 4
// https://github.com/tc39/proposal-float16array

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/d3be7e171bf3149fe93c3ce5a85280f1eba3ef8d/src/lib/esnext.float16.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface Math {
  f16round(x: number): number;
}

interface DataView<TArrayBuffer extends ArrayBufferLike> {
  getFloat16(byteOffset: number, littleEndian?: boolean): number;

  setFloat16(byteOffset: number, value: number, littleEndian?: boolean): void;
}


