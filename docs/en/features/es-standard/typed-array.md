---
category: feature
tag:
  - es-standard
---

# `TypedArray`s

Implementations and fixes for `ArrayBuffer`, `DataView`, Typed Arrays constructors, static and prototype methods. Typed arrays work only in environments with support descriptors (IE9+), `ArrayBuffer` and `DataView` should work anywhere.

## Modules

- [`es.array-buffer.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array-buffer.constructor.js)
- [`es.array-buffer.is-view`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array-buffer.is-view.js)
- [`es.array-buffer.slice`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array-buffer.slice.js)
- [`es.data-view`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.data-view.js)
- [`es.typed-array.int8-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.int8-array.js)
- [`es.typed-array.uint8-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.uint8-array.js)
- [`es.typed-array.uint8-clamped-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.uint8-clamped-array.js)
- [`es.typed-array.int16-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.int16-array.js)
- [`es.typed-array.uint16-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.uint16-array.js)
- [`es.typed-array.int32-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed.int32-array.js)
- [`es.typed-array.uint32-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.uint32-array.js)
- [`es.typed-array.float32-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.float32-array.js)
- [`es.typed-array.float64-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.float64-array.js)
- [`es.typed-array.copy-within`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.copy-within.js)
- [`es.typed-array.every`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.every.js)
- [`es.typed-array.fill`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.fill.js)
- [`es.typed-array.filter`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.filter.js)
- [`es.typed-array.find`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.find.js)
- [`es.typed-array.find-index`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.find-index.js)
- [`es.typed-array.find-last`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.find-last.js)
- [`es.typed-array.find-last-index`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.find-last-index.js)
- [`es.typed-array.for-each`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.for-each.js)
- [`es.typed-array.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.from.js)
- [`es.typed-array.includes`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.includes.js)
- [`es.typed-array.index-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.index-of.js)
- [`es.typed-array.iterator`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.iterator.js)
- [`es.typed-array.last-index-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.last-index-of.js)
- [`es.typed-array.map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.map.js)
- [`es.typed-array.of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.of.js)
- [`es.typed-array.reduce`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.reduce.js)
- [`es.typed-array.reduce-right`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.reduce-right.js)
- [`es.typed-array.reverse`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.reverse.js)
- [`es.typed-array.set`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.set.js)
- [`es.typed-array.slice`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.slice.js)
- [`es.typed-array.some`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.some.js)
- [`es.typed-array.sort`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.sort.js)
- [`es.typed-array.subarray`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.subarray.js)
- [`es.typed-array.to-locale-string`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.to-locale-string.js)
- [`es.typed-array.to-string`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.to-string.js)
- [`es.typed-array.at`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.at.js)
- [`esnext.typed-array.to-reversed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.typed-array.to-reversed.js)
- [`esnext.typed-array.to-sorted`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.typed-array.to-sorted.js)
- [`esnext.typed-array.with`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.typed-array.with.js)

## Types

```ts
class ArrayBuffer {
  constructor(length: number);
  slice(start: number, end: number): ArrayBuffer;
  readonly byteLength: number;
  static isView(arg: any): boolean;
}

class DataView {
  constructor(buffer: ArrayBuffer, byteOffset?: number, byteLength?: number);
  getInt8(offset: any): number;
  getUint8(offset: any): number;
  /**@param littleEndian @default false */
  getInt16(offset: any, littleEndian?: boolean): number;
  /**@param littleEndian @default false */
  getUnumber(offset: any, littleEndian?: boolean): number;
  /**@param littleEndian @default false */
  getInt32(offset: any, littleEndian?: boolean): number;
  /**@param littleEndian @default false */
  getUint32(offset: any, littleEndian?: boolean): number;
  /**@param littleEndian @default false */
  getFloat32(offset: any, littleEndian?: boolean): number;
  /**@param littleEndian @default false */
  getFloat64(offset: any, littleEndian?: boolean): number;
  setInt8(offset: any, value: any): void;
  setUint8(offset: any, value: any): void;
  /**@param littleEndian @default false */
  setInt16(offset: any, value: any, littleEndian?: boolean): void;
  /**@param littleEndian @default false */
  setUint16(offset: any, value: any, littleEndian?: boolean): void;
  /**@param littleEndian @default false */
  setInt32(offset: any, value: any, littleEndian?: boolean): void;
  /**@param littleEndian @default false */
  setUint32(offset: any, value: any, littleEndian?: boolean): void;
  /**@param littleEndian @default false */
  setFloat32(offset: any, value: any, littleEndian?: boolean): void;
  /**@param littleEndian @default false */
  setFloat64(offset: any, value: any, littleEndian?: boolean): void;
  readonly buffer: ArrayBuffer;
  readonly byteLength: number;
  readonly byteOffset: number;
}

abstract class TypedArray {
  constructor(length: number);
  constructor(object: TypedArray | Iterable<number> | ArrayLike<number>);
  constructor(buffer: ArrayBuffer, byteOffset?: number, length?: number);
  static from(
    items: Iterable<number> | ArrayLike<number>,
    mapFn?: (value: any, index: number) => any,
    thisArg?: any
  ): TypedArray;
  static of(...args: Array<number>): TypedArray;
  BYTES_PER_ELEMENT: number;
  abstract at(index: number): number;
  abstract copyWithin(target: number, start: number, end?: number): this;
  abstract entries(): Iterator<[number, number]>;
  abstract every(
    callbackfn: (value: number, index: number, target: TypedArray) => boolean,
    thisArg?: any
  ): boolean;
  abstract fill(value: number, start?: number, end?: number): this;
  abstract filter(
    callbackfn: (value: number, index: number, target: TypedArray) => boolean,
    thisArg?: any
  ): TypedArray;
  abstract find(
    callbackfn: (value: number, index: number, target: TypedArray) => boolean,
    thisArg?: any
  ): any;
  abstract findIndex(
    callbackfn: (value: number, index: number, target: TypedArray) => boolean,
    thisArg?: any
  ): number;
  abstract findLast(
    callbackfn: (value: any, index: number, target: TypedArray) => boolean,
    thisArg?: any
  ): any;
  abstract findLastIndex(
    callbackfn: (value: any, index: number, target: TypedArray) => boolean,
    thisArg?: any
  ): number;
  abstract forEach(
    callbackfn: (value: number, index: number, target: TypedArray) => void,
    thisArg?: any
  ): void;
  abstract includes(searchElement: any, from?: number): boolean;
  abstract indexOf(searchElement: any, from?: number): number;
  /**@param separator @default ','*/
  abstract join(separator: string): string;
  abstract keys(): Iterator<number>;
  abstract lastIndexOf(searchElement: any, from?: number): number;
  abstract map(
    mapFn: (value: number, index: number, target: TypedArray) => number,
    thisArg?: any
  ): TypedArray;
  abstract reduce(
    callbackfn: (
      memo: any,
      value: number,
      index: number,
      target: TypedArray
    ) => any,
    initialValue?: any
  ): any;
  abstract reduceRight(
    callbackfn: (
      memo: any,
      value: number,
      index: number,
      target: TypedArray
    ) => any,
    initialValue?: any
  ): any;
  abstract reverse(): this;
  abstract set(array: ArrayLike<any>, offset?: number): void;
  abstract slice(start?: number, end?: number): TypedArray;
  abstract some(
    callbackfn: (value: number, index: number, target: TypedArray) => boolean,
    thisArg?: any
  ): boolean;
  abstract sort(comparefn?: (a: number, b: number) => number): this; // with modern behavior like stable sort
  abstract subarray(begin?: number, end?: number): TypedArray;
  abstract toReversed(): TypedArray;
  abstract toSorted(comparefn?: (a: any, b: any) => number): TypedArray;
  abstract toString(): string;
  abstract toLocaleString(): string;
  abstract values(): Iterator<number>;
  abstract with(index: number, value: any): TypedArray;
  [Symbol.iterator](): Iterator<number>;
  readonly buffer: ArrayBuffer;
  readonly byteLength: number;
  readonly byteOffset: number;
  readonly length: number;
  BYTES_PER_ELEMENT: number;
}
interface TypedArrayConstructor {}

class Int8Array extends TypedArray {}
class Uint8Array extends TypedArray {}
class Int16Array extends TypedArray {}
class Uint16Array extends TypedArray {}
class Int32Array extends TypedArray {}
class Uint32Array extends TypedArray {}
class Float32Array extends TypedArray {}
class Float64Array extends TypedArray {}
```

## Entry points

```
core-js/es|stable|actual|full/array-buffer
core-js/es|stable|actual|full/array-buffer/constructor
core-js/es|stable|actual|full/array-buffer/is-view
core-js/es|stable|actual|full/array-buffer/slice
core-js/es|stable|actual|full/data-view
core-js/es|stable|actual|full/typed-array
core-js/es|stable|actual|full/typed-array/int8-array
core-js/es|stable|actual|full/typed-array/uint8-array
core-js/es|stable|actual|full/typed-array/uint8-clamped-array
core-js/es|stable|actual|full/typed-array/int16-array
core-js/es|stable|actual|full/typed-array/uint16-array
core-js/es|stable|actual|full/typed-array/int32-array
core-js/es|stable|actual|full/typed-array/uint32-array
core-js/es|stable|actual|full/typed-array/float32-array
core-js/es|stable|actual|full/typed-array/float64-array
core-js/es|stable|actual|full/typed-array/at
core-js/es|stable|actual|full/typed-array/copy-within
core-js/es|stable|actual|full/typed-array/entries
core-js/es|stable|actual|full/typed-array/every
core-js/es|stable|actual|full/typed-array/fill
core-js/es|stable|actual|full/typed-array/filter
core-js/es|stable|actual|full/typed-array/find
core-js/es|stable|actual|full/typed-array/find-index
core-js/es|stable|actual|full/typed-array/find-last
core-js/es|stable|actual|full/typed-array/find-last-index
core-js/es|stable|actual|full/typed-array/for-each
core-js/es|stable|actual|full/typed-array/from
core-js/es|stable|actual|full/typed-array/includes
core-js/es|stable|actual|full/typed-array/index-of
core-js/es|stable|actual|full/typed-array/iterator
core-js/es|stable|actual|full/typed-array/join
core-js/es|stable|actual|full/typed-array/keys
core-js/es|stable|actual|full/typed-array/last-index-of
core-js/es|stable|actual|full/typed-array/map
core-js/es|stable|actual|full/typed-array/of
core-js/es|stable|actual|full/typed-array/reduce
core-js/es|stable|actual|full/typed-array/reduce-right
core-js/es|stable|actual|full/typed-array/reverse
core-js/es|stable|actual|full/typed-array/set
core-js/es|stable|actual|full/typed-array/slice
core-js/es|stable|actual|full/typed-array/some
core-js/es|stable|actual|full/typed-array/sort
core-js/es|stable|actual|full/typed-array/subarray
core-js/es|stable|actual|full/typed-array/to-locale-string
core-js/es|stable|actual|full/typed-array/to-reversed
core-js/es|stable|actual|full/typed-array/to-sorted
core-js/es|stable|actual|full/typed-array/to-string
core-js/es|stable|actual|full/typed-array/values
core-js/es|stable|actual|full/typed-array/with
```

## Example

[_Example_](https://is.gd/Eo7ltU):

```js
new Int32Array(4); // => [0, 0, 0, 0]
new Uint8ClampedArray([1, 2, 3, 666]); // => [1, 2, 3, 255]
new Float32Array(new Set([1, 2, 3, 2, 1])); // => [1, 2, 3]

let buffer = new ArrayBuffer(8);
let view = new DataView(buffer);
view.setFloat64(0, 123.456, true);
new Uint8Array(buffer.slice(4)); // => [47, 221, 94, 64]

Int8Array.of(1, 1.5, 5.7, 745); // => [1, 1, 5, -23]
Uint8Array.from([1, 1.5, 5.7, 745]); // => [1, 1, 5, 233]

let typed = new Uint8Array([1, 2, 3]);

let a = typed.slice(1); // => [2, 3]
typed.buffer === a.buffer; // => false
let b = typed.subarray(1); // => [2, 3]
typed.buffer === b.buffer; // => true

typed.filter((it) => it % 2); // => [1, 3]
typed.map((it) => it * 1.5); // => [1, 3, 4]

for (let value of typed) console.log(value); // => 1, 2, 3
for (let value of typed.values()) console.log(value); // => 1, 2, 3
for (let key of typed.keys()) console.log(key); // => 0, 1, 2
for (let [key, value] of typed.entries()) {
  console.log(key); // => 0, 1, 2
  console.log(value); // => 1, 2, 3
}

new Int32Array([1, 2, 3]).at(1); // => 2
new Int32Array([1, 2, 3]).at(-1); // => 3
```

## Caveats when using typed arrays polyfills:

- Polyfills of Typed Arrays constructors work completely how should work by the spec, but because of internal usage of getters / setters on each instance, are slow and consumes significant memory. However, polyfills of Typed Arrays constructors required mainly for old IE, all modern engines have native Typed Arrays constructors and require only fixes of constructors and polyfills of methods.
