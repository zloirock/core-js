// proposal stage: 4
// https://github.com/tc39/proposal-array-find-from-last

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/069de743dbd17b47cc2fc58e1d16da5410911284/src/lib/es2023.array.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface Array<T> {
  findLast<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): S | undefined;

  findLast(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): T | undefined;

  findLastIndex(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): number;
}

interface Int8Array {
  findLast<S extends number>(predicate: (value: number, index: number, array: this) => value is S, thisArg?: any): S | undefined;

  findLast(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number | undefined;

  findLastIndex(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number;
}

interface Uint8Array {
  findLast<S extends number>(predicate: (value: number, index: number, array: this) => value is S, thisArg?: any): S | undefined;

  findLast(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number | undefined;

  findLastIndex(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number;
}

interface Uint8ClampedArray {
  findLast<S extends number>(predicate: (value: number, index: number, array: this) => value is S, thisArg?: any): S | undefined;

  findLast(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number | undefined;

  findLastIndex(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number;
}

interface Int16Array {
  findLast<S extends number>(predicate: (value: number, index: number, array: this) => value is S, thisArg?: any): S | undefined;

  findLast(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number | undefined;

  findLastIndex(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number;
}

interface Uint16Array {
  findLast<S extends number>(predicate: (value: number, index: number, array: this) => value is S, thisArg?: any): S | undefined;

  findLast(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number | undefined;

  findLastIndex(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number;
}

interface Int32Array {
  findLast<S extends number>(predicate: (value: number, index: number, array: this) => value is S, thisArg?: any): S | undefined;

  findLast(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number | undefined;

  findLastIndex(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number;
}

interface Uint32Array {
  findLast<S extends number>(predicate: (value: number, index: number, array: this) => value is S, thisArg?: any): S | undefined;

  findLast(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number | undefined;

  findLastIndex(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number;
}

interface Float32Array {
  findLast<S extends number>(predicate: (value: number, index: number, array: this) => value is S, thisArg?: any): S | undefined;

  findLast(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number | undefined;

  findLastIndex(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number;
}

interface Float64Array {
  findLast<S extends number>(predicate: (value: number, index: number, array: this) => value is S, thisArg?: any): S | undefined;

  findLast(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number | undefined;

  findLastIndex(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number;
}

interface BigInt64Array {
  findLast<S extends bigint>(predicate: (value: bigint, index: number, array: this) => value is S, thisArg?: any): S | undefined;

  findLast(predicate: (value: bigint, index: number, array: this) => unknown, thisArg?: any): bigint | undefined;

  findLastIndex(predicate: (value: bigint, index: number, array: this) => unknown, thisArg?: any): number;
}

interface BigUint64Array {
  findLast<S extends bigint>(predicate: (value: bigint, index: number, array: this) => value is S, thisArg?: any): S | undefined;

  findLast(predicate: (value: bigint, index: number, array: this) => unknown, thisArg?: any): bigint | undefined;

  findLastIndex(predicate: (value: bigint, index: number, array: this) => unknown, thisArg?: any): number;
}
