// proposal stage: 1
// https://github.com/tc39/proposal-array-unique
interface Array<T> {
  uniqueBy(resolver?: keyof T | ((value: T) => PropertyKey)): Array<T>;
}

interface Int8Array {
  uniqueBy(resolver?: PropertyKey | ((value: number) => PropertyKey)): Int8Array;
}

interface Uint8Array {
  uniqueBy(resolver?: PropertyKey | ((value: number) => PropertyKey)): Uint8Array;
}

interface Uint8ClampedArray {
  uniqueBy(resolver?: PropertyKey | ((value: number) => PropertyKey)): Uint8ClampedArray;
}

interface Int16Array {
  uniqueBy(resolver?: PropertyKey | ((value: number) => PropertyKey)): Int16Array;
}

interface Uint16Array {
  uniqueBy(resolver?: PropertyKey | ((value: number) => PropertyKey)): Uint16Array;
}

interface Int32Array {
  uniqueBy(resolver?: PropertyKey | ((value: number) => PropertyKey)): Int32Array;
}

interface Uint32Array {
  uniqueBy(resolver?: PropertyKey | ((value: number) => PropertyKey)): Uint32Array;
}

interface Float32Array {
  uniqueBy(resolver?: PropertyKey | ((value: number) => PropertyKey)): Float32Array;
}

interface Float64Array {
  uniqueBy(resolver?: PropertyKey | ((value: number) => PropertyKey)): Float64Array;
}

interface BigInt64Array {
  uniqueBy(resolver?: PropertyKey | ((value: bigint) => PropertyKey)): BigInt64Array;
}

interface BigUint64Array {
  uniqueBy(resolver?: PropertyKey | ((value: bigint) => PropertyKey)): BigUint64Array;
}
