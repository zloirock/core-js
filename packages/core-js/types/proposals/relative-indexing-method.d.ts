// proposal stage: 4
// https://github.com/tc39/proposal-relative-indexing-method

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/f450c1b80ce6dc7b04e81899db00534018932234/src/lib/es2022.array.d.ts
// https://github.com/microsoft/TypeScript/blob/f450c1b80ce6dc7b04e81899db00534018932234/src/lib/es2022.string.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface String {
  at(index: number): string | undefined;
}

interface Array<T> {
  at(index: number): T | undefined;
}

interface ReadonlyArray<T> {
  at(index: number): T | undefined;
}

interface Int8Array<TArrayBuffer extends ArrayBufferLike> {
  at(index: number): number | undefined;
}

interface Uint8Array<TArrayBuffer extends ArrayBufferLike> {
  at(index: number): number | undefined;
}

interface Uint8ClampedArray<TArrayBuffer extends ArrayBufferLike> {
  at(index: number): number | undefined;
}

interface Int16Array<TArrayBuffer extends ArrayBufferLike> {
  at(index: number): number | undefined;
}

interface Uint16Array<TArrayBuffer extends ArrayBufferLike> {
  at(index: number): number | undefined;
}

interface Int32Array<TArrayBuffer extends ArrayBufferLike> {
  at(index: number): number | undefined;
}

interface Uint32Array<TArrayBuffer extends ArrayBufferLike> {
  at(index: number): number | undefined;
}

interface Float32Array<TArrayBuffer extends ArrayBufferLike> {
  at(index: number): number | undefined;
}

interface Float64Array<TArrayBuffer extends ArrayBufferLike> {
  at(index: number): number | undefined;
}

interface BigInt64Array<TArrayBuffer extends ArrayBufferLike> {
  at(index: number): bigint | undefined;
}

interface BigUint64Array<TArrayBuffer extends ArrayBufferLike> {
  at(index: number): bigint | undefined;
}
