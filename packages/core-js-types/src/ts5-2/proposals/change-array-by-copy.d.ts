// proposal stage: 4
// https://github.com/tc39/proposal-change-array-by-copy

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/6afd0fb73fa18a48021ed54f44a0c51794519bf6/src/lib/es2023.array.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

declare global {
  interface Array<T> {
    toReversed(): T[];

    toSorted(compareFn?: (a: T, b: T) => number): T[];

    toSpliced(start: number, deleteCount: number, ...items: T[]): T[];

    toSpliced(start: number, deleteCount?: number): T[];

    with(index: number, value: T): T[];
  }

  interface Int8Array {
    toReversed(): Int8Array;

    toSorted(compareFn?: (a: number, b: number) => number): Int8Array;

    with(index: number, value: number): Int8Array;
  }

  interface Uint8Array {
    toReversed(): Uint8Array;

    toSorted(compareFn?: (a: number, b: number) => number): Uint8Array;

    with(index: number, value: number): Uint8Array;
  }

  interface Uint8ClampedArray {
    toReversed(): Uint8ClampedArray;

    toSorted(compareFn?: (a: number, b: number) => number): Uint8ClampedArray;

    with(index: number, value: number): Uint8ClampedArray;
  }

  interface Int16Array {
    toReversed(): Int16Array;

    toSorted(compareFn?: (a: number, b: number) => number): Int16Array;

    with(index: number, value: number): Int16Array;
  }

  interface Uint16Array {
    toReversed(): Uint16Array;

    toSorted(compareFn?: (a: number, b: number) => number): Uint16Array;

    with(index: number, value: number): Uint16Array;
  }

  interface Int32Array {
    toReversed(): Int32Array;

    toSorted(compareFn?: (a: number, b: number) => number): Int32Array;

    with(index: number, value: number): Int32Array;
  }

  interface Uint32Array {
    toReversed(): Uint32Array;

    toSorted(compareFn?: (a: number, b: number) => number): Uint32Array;

    with(index: number, value: number): Uint32Array;
  }

  interface Float32Array {
    toReversed(): Float32Array;

    toSorted(compareFn?: (a: number, b: number) => number): Float32Array;

    with(index: number, value: number): Float32Array;
  }

  interface Float64Array {
    toReversed(): Float64Array;

    toSorted(compareFn?: (a: number, b: number) => number): Float64Array;

    with(index: number, value: number): Float64Array;
  }

  interface BigInt64Array {
    toReversed(): BigInt64Array;

    toSorted(compareFn?: (a: bigint, b: bigint) => number): BigInt64Array;

    with(index: number, value: bigint): BigInt64Array;
  }

  interface BigUint64Array {
    toReversed(): BigUint64Array;

    toSorted(compareFn?: (a: bigint, b: bigint) => number): BigUint64Array;

    with(index: number, value: bigint): BigUint64Array;
  }
}

export {};
