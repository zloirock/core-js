// proposal stage: 1
// https://github.com/tc39/proposal-array-unique

interface Array<T> {
  uniqueBy(resolver?: keyof T | ((value: T) => any)): Array<T>;
}

interface Int8Array {
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Int8Array;
}

interface Uint8Array {
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Uint8Array;
}

interface Uint8ClampedArray {
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Uint8ClampedArray;
}

interface Int16Array {
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Int16Array;
}

interface Uint16Array {
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Uint16Array;
}

interface Int32Array {
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Int32Array;
}

interface Uint32Array {
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Uint32Array;
}

interface Float32Array {
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Float32Array;
}

interface Float64Array {
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Float64Array;
}

interface BigInt64Array {
  uniqueBy(resolver?: PropertyKey | ((value: bigint) => any)): BigInt64Array;
}

interface BigUint64Array {
  uniqueBy(resolver?: PropertyKey | ((value: bigint) => any)): BigUint64Array;
}
