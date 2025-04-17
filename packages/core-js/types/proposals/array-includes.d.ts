// proposal stage: 4
// https://github.com/tc39/proposal-Array.prototype.includes
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
