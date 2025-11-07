// proposal stage: 4
// https://github.com/tc39/proposal-Array.prototype.includes

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/069de743dbd17b47cc2fc58e1d16da5410911284/src/lib/es2016.array.include.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface Array<T> {
  includes(searchElement: T, fromIndex?: number): boolean;
}

interface Int8Array {
  includes(searchElement: number, fromIndex?: number): boolean;
}

interface Uint8Array {
  includes(searchElement: number, fromIndex?: number): boolean;
}

interface Uint8ClampedArray {
  includes(searchElement: number, fromIndex?: number): boolean;
}

interface Int16Array {
  includes(searchElement: number, fromIndex?: number): boolean;
}

interface Uint16Array {
  includes(searchElement: number, fromIndex?: number): boolean;
}

interface Int32Array {
  includes(searchElement: number, fromIndex?: number): boolean;
}

interface Uint32Array {
  includes(searchElement: number, fromIndex?: number): boolean;
}

interface Float32Array {
  includes(searchElement: number, fromIndex?: number): boolean;
}

interface Float64Array {
  includes(searchElement: number, fromIndex?: number): boolean;
}

interface BigInt64Array {
  includes(searchElement: bigint, fromIndex?: number): boolean;
}

interface BigUint64Array {
  includes(searchElement: bigint, fromIndex?: number): boolean;
}
