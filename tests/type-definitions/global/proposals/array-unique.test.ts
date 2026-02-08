import 'core-js/full';
import uniqueBy from 'core-js/full/array/unique-by';
import { assertNumberArray } from '../../helpers.js';

const uniqueByNS: number[] = uniqueBy([1, 2, 1, 3]);

// @ts-expect-error
uniqueBy([1, 2, 3], 123);

interface Obj {
  a: number;
  b: string
}
const arr: Obj[] = [{ a: 1, b: 'x' }, { a: 2, b: 'y' }];
const arrRes: Obj[] = arr.uniqueBy();
const arrRes2: Obj[] = arr.uniqueBy('a');
const arrRes3: Obj[] = arr.uniqueBy(obj => obj.b);

const numArr: number[] = [1, 2, 1, 3];
assertNumberArray(numArr.uniqueBy());
assertNumberArray(numArr.uniqueBy(x => x % 2));

const i8 = new Int8Array([1, 2, 2, 3]);
const i8Res: Int8Array = i8.uniqueBy();
const i8Res2: Int8Array = i8.uniqueBy('length');
const i8Res3: Int8Array = i8.uniqueBy(x => x % 2);

const u8 = new Uint8Array([1, 2, 2, 3]);
const u8Res: Uint8Array = u8.uniqueBy();
const u8Res2: Uint8Array = u8.uniqueBy('buffer');
const u8Res3: Uint8Array = u8.uniqueBy(x => x * 2);

const u8c = new Uint8ClampedArray([1, 1, 2, 3]);
const u8cRes: Uint8ClampedArray = u8c.uniqueBy();
const u8cRes2: Uint8ClampedArray = u8c.uniqueBy('byteOffset');
const u8cRes3: Uint8ClampedArray = u8c.uniqueBy(x => x);

const i16 = new Int16Array([1, 1, 2, 3]);
const i16Res: Int16Array = i16.uniqueBy();
const i16Res2: Int16Array = i16.uniqueBy('BYTES_PER_ELEMENT');
const i16Res3: Int16Array = i16.uniqueBy(x => x);

const u16 = new Uint16Array([1, 2, 2, 3]);
const u16Res: Uint16Array = u16.uniqueBy();
const u16Res2: Uint16Array = u16.uniqueBy('buffer');
const u16Res3: Uint16Array = u16.uniqueBy(x => x + 1);

const i32 = new Int32Array([1, 2, 2, 3]);
const i32Res: Int32Array = i32.uniqueBy();
const i32Res2: Int32Array = i32.uniqueBy('byteLength');
const i32Res3: Int32Array = i32.uniqueBy(x => x);

const u32 = new Uint32Array([1, 1, 2, 3]);
const u32Res: Uint32Array = u32.uniqueBy();
const u32Res2: Uint32Array = u32.uniqueBy('length');
const u32Res3: Uint32Array = u32.uniqueBy(x => x % 2);

const f32 = new Float32Array([1.5, 2.5, 1.5, 3.5]);
const f32Res: Float32Array = f32.uniqueBy();
const f32Res2: Float32Array = f32.uniqueBy('constructor');
const f32Res3: Float32Array = f32.uniqueBy(x => Math.floor(x));

const f64 = new Float64Array([1.5, 2.5, 1.5, 3.5]);
const f64Res: Float64Array = f64.uniqueBy();
const f64Res2: Float64Array = f64.uniqueBy('length');
const f64Res3: Float64Array = f64.uniqueBy(x => x.toFixed(1));

// todo for es6
// const bi64 = new BigInt64Array([BigInt(1), BigInt(2), BigInt(1), BigInt(3)]);
// const bi64Res: BigInt64Array = bi64.uniqueBy();
// const bi64Res2: BigInt64Array = bi64.uniqueBy('length');
// const bi64Res3: BigInt64Array = bi64.uniqueBy(x => (x as bigint) % BigInt(2));
//
// const bu64 = new BigUint64Array([BigInt(1), BigInt(2), BigInt(1), BigInt(3)]);
// const bu64Res: BigUint64Array = bu64.uniqueBy();
// const bu64Res2: BigUint64Array = bu64.uniqueBy('length');
// const bu64Res3: BigUint64Array = bu64.uniqueBy(x => (x as bigint) * BigInt(3));

// @ts-expect-error
arr.uniqueBy(123);
// @ts-expect-error
arr.uniqueBy(true);
// @ts-expect-error
arr.uniqueBy({});
// @ts-expect-error
arr.uniqueBy(['a']);

// @ts-expect-error
numArr.uniqueBy(1);
// @ts-expect-error
numArr.uniqueBy({});
// @ts-expect-error
numArr.uniqueBy(true);

// @ts-expect-error
i8.uniqueBy([]);
// @ts-expect-error
i8.uniqueBy({});

// @ts-expect-error
u8.uniqueBy([]);
// @ts-expect-error
u8.uniqueBy(false);

// @ts-expect-error
u8c.uniqueBy([]);
// @ts-expect-error
u8c.uniqueBy(undefined, 1);

// @ts-expect-error
i16.uniqueBy([]);
// @ts-expect-error
i16.uniqueBy(function (x: string) { return x; });

// @ts-expect-error
u16.uniqueBy([]);
// @ts-expect-error
u16.uniqueBy(false);

// @ts-expect-error
i32.uniqueBy([]);
// @ts-expect-error
i32.uniqueBy({});

// @ts-expect-error
u32.uniqueBy([]);
// @ts-expect-error
u32.uniqueBy(false);

// @ts-expect-error
f32.uniqueBy([]);
// @ts-expect-error
f32.uniqueBy({});

// @ts-expect-error
f64.uniqueBy([]);
// @ts-expect-error
f64.uniqueBy(false);

// // @ts-expect-error
// bi64.uniqueBy([]);
// // @ts-expect-error
// bi64.uniqueBy({});
//
// // @ts-expect-error
// bu64.uniqueBy([]);
// // @ts-expect-error
// bu64.uniqueBy({});
