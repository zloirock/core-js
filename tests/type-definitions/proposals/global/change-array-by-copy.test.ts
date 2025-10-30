import 'core-js/full';
import '@core-js/types';

const arr: number[] = [1, 2, 3];
const arrRev: number[] = arr.toReversed();
const arrSorted: number[] = arr.toSorted();
const arrSorted2: number[] = arr.toSorted((a, b) => b - a);
const arrSpliced: number[] = arr.toSpliced(1, 1, 4, 5);
const arrSpliced2: number[] = arr.toSpliced(1);
const arrSpliced3: number[] = arr.toSpliced(1, 2);
const arrWith: number[] = arr.with(1, 42);

const sarr: string[] = ['a', 'b', 'c'];
const sarrRev: string[] = sarr.toReversed();
const sarrSorted: string[] = sarr.toSorted();
const sarrWith: string[] = sarr.with(0, 'z');
const sarrSpliced: string[] = sarr.toSpliced(0, 1, 'x');

const i8 = new Int8Array([1, 2, 3]);
const i8Rev: Int8Array = i8.toReversed();
const i8Sorted: Int8Array = i8.toSorted();
const i8Sorted2: Int8Array = i8.toSorted((a, b) => b - a);
const i8With: Int8Array = i8.with(0, 10);

const u8 = new Uint8Array([1,2,3]);
const u8Rev: Uint8Array = u8.toReversed();
const u8Sorted: Uint8Array = u8.toSorted();
const u8Sorted2: Uint8Array = u8.toSorted((a, b) => a - b);
const u8With: Uint8Array = u8.with(1, 42);

const u8c = new Uint8ClampedArray([1,2,3]);
const u8cRev: Uint8ClampedArray = u8c.toReversed();
const u8cSorted: Uint8ClampedArray = u8c.toSorted();
const u8cSorted2: Uint8ClampedArray = u8c.toSorted((a, b) => b - a);
const u8cWith: Uint8ClampedArray = u8c.with(1, 99);

const i16 = new Int16Array([1,2,3]);
const i16Rev: Int16Array = i16.toReversed();
const i16Sorted: Int16Array = i16.toSorted();
const i16With: Int16Array = i16.with(1, 2);

const u16 = new Uint16Array([1,2,3]);
const u16Rev: Uint16Array = u16.toReversed();
const u16Sorted: Uint16Array = u16.toSorted();
const u16With: Uint16Array = u16.with(1, 2);

const i32 = new Int32Array([1,2,3]);
const i32Rev: Int32Array = i32.toReversed();
const i32Sorted: Int32Array = i32.toSorted();
const i32With: Int32Array = i32.with(1, 2);

const u32 = new Uint32Array([1,2,3]);
const u32Rev: Uint32Array = u32.toReversed();
const u32Sorted: Uint32Array = u32.toSorted();
const u32With: Uint32Array = u32.with(1, 2);

const f32 = new Float32Array([1.1, 2.2, 3.3]);
const f32Rev: Float32Array = f32.toReversed();
const f32Sorted: Float32Array = f32.toSorted();
const f32With: Float32Array = f32.with(1, 8.8);

const f64 = new Float64Array([1.1, 2.2, 3.3]);
const f64Rev: Float64Array = f64.toReversed();
const f64Sorted: Float64Array = f64.toSorted();
const f64With: Float64Array = f64.with(0, 2.2);

// todo for es6
// const bi64 = new (BigInt64Array as { new(arr: ArrayLike<bigint>): BigInt64Array })([BigInt(1), BigInt(2), BigInt(3)]);
// const bi64Rev: BigInt64Array = bi64.toReversed();
// const bi64Sorted: BigInt64Array = bi64.toSorted();
// const bi64Sorted2: BigInt64Array = bi64.toSorted((a, b) => (a > b ? 1 : -1));
// const bi64With: BigInt64Array = bi64.with(2, BigInt(100));
//
// const bu64 = new (BigUint64Array as { new(arr: ArrayLike<bigint>): BigUint64Array })([BigInt(1), BigInt(2), BigInt(3)]);
// const bu64Rev: BigUint64Array = bu64.toReversed();
// const bu64Sorted: BigUint64Array = bu64.toSorted();
// const bu64Sorted2: BigUint64Array = bu64.toSorted((a, b) => (a > b ? 1 : -1));
// const bu64With: BigUint64Array = bu64.with(0, BigInt(50));

// @ts-expect-error
arr.toReversed(1);
// @ts-expect-error
arr.toSorted('string');
// @ts-expect-error
arr.toSorted((a: number, b: string) => 0);
// @ts-expect-error
arr.toSpliced();
// @ts-expect-error
arr.toSpliced('1', 1);
// @ts-expect-error
arr.toSpliced(1, '1');
// @ts-expect-error
arr.with();
// @ts-expect-error
arr.with(1);
// @ts-expect-error
arr.with('1', 2);

const barr: boolean[] = [true, false];
// @ts-expect-error
barr.toSorted((a: number, b: number) => 0);
// @ts-expect-error
barr.with(0, 1);

const arrStr: string[] = ['a', 'b'];
// @ts-expect-error
arrStr.with(0, 1);

// @ts-expect-error
i8.toReversed(1);
// @ts-expect-error
i8.toSorted('');
// @ts-expect-error
i8.toSorted((a: string, b: string) => 0);
// @ts-expect-error
i8.with();
// @ts-expect-error
i8.with('1', 1);
// @ts-expect-error
i8.with(0, '1');


// @ts-expect-error
u8.toReversed(1);
// @ts-expect-error
u8.toSorted('str');
// @ts-expect-error
u8.with(0, 'v');


// @ts-expect-error
u8c.toSorted('str');
// @ts-expect-error
u8c.with(0, '1');

// @ts-expect-error
i16.toReversed('1');
// @ts-expect-error
i16.toSorted((a: string, b: string) => 0);
// @ts-expect-error
i16.with(0, 'a');

// @ts-expect-error
u16.toReversed(null);
// @ts-expect-error
u16.toSorted('a');
// @ts-expect-error
u16.with(0, 'a');

// @ts-expect-error
i32.toSorted([]);
// @ts-expect-error
i32.with('test', 1);
// @ts-expect-error
i32.with(1, 'foo');

// @ts-expect-error
u32.with('0', 0);
// @ts-expect-error
u32.with(1, 'foo');

// @ts-expect-error
f32.toReversed('abc');
// @ts-expect-error
f32.with(0, 'a');

// @ts-expect-error
f64.toSorted(1,2);
// @ts-expect-error
f64.with('a', 1);

// // @ts-expect-error
// bi64.toReversed(1);
// // @ts-expect-error
// bi64.toSorted('f');
// // @ts-expect-error
// bi64.toSorted((a: number, b: number) => 0);
// // @ts-expect-error
// bi64.with(1, 1);
// // @ts-expect-error
// bi64.with('a', BigInt(1));

// @ts-expect-error
bu64.toSorted({});
// @ts-expect-error
bu64.with(0, 1);
// @ts-expect-error
bu64.with('abc', BigInt(1));
