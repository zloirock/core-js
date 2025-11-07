// proposal stage: 1
// https://github.com/tc39/proposal-array-filtering

interface Array<T> {
  filterReject(callbackFn: (value: T, index: number, target: T[]) => boolean, thisArg?: any): T[];
}

interface Int8Array {
  filterReject(callbackFn: (value: number, index: number, target: Int8Array) => boolean, thisArg?: any): Int8Array;
}

interface Uint8Array {
  filterReject(callbackFn: (value: number, index: number, target: Uint8Array) => boolean, thisArg?: any): Uint8Array;
}

interface Uint8ClampedArray {
  filterReject(callbackFn: (value: number, index: number, target: Uint8ClampedArray) => boolean, thisArg?: any): Uint8ClampedArray;
}

interface Int16Array {
  filterReject(callbackFn: (value: number, index: number, target: Int16Array) => boolean, thisArg?: any): Int16Array;
}

interface Uint16Array {
  filterReject(callbackFn: (value: number, index: number, target: Uint16Array) => boolean, thisArg?: any): Uint16Array;
}

interface Int32Array {
  filterReject(callbackFn: (value: number, index: number, target: Int32Array) => boolean, thisArg?: any): Int32Array;
}

interface Uint32Array {
  filterReject(callbackFn: (value: number, index: number, target: Uint32Array) => boolean, thisArg?: any): Uint32Array;
}

interface Float32Array {
  filterReject(callbackFn: (value: number, index: number, target: Float32Array) => boolean, thisArg?: any): Float32Array;
}

interface Float64Array {
  filterReject(callbackFn: (value: number, index: number, target: Float64Array) => boolean, thisArg?: any): Float64Array;
}

interface BigInt64Array {
  filterReject(callbackFn: (value: bigint, index: number, target: BigInt64Array) => boolean, thisArg?: any): BigInt64Array;
}

interface BigUint64Array {
  filterReject(callbackFn: (value: bigint, index: number, target: BigUint64Array) => boolean, thisArg?: any): BigUint64Array;
}
