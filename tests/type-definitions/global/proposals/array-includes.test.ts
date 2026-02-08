import 'core-js/es';
import includes from 'core-js/es/array/includes';
import { assertBool } from '../../helpers.js';

const arr = [1, 2, 3];

assertBool(includes(arr, 2));

// @ts-expect-error
includes(arr);

assertBool(arr.includes(2));
assertBool(arr.includes(2, 1));

const strArr: string[] = ['a', 'b', 'c'];
assertBool(strArr.includes('b'));
assertBool(strArr.includes('b', 1));

const i8 = new Int8Array([1, 2, 3]);
assertBool(i8.includes(2));
assertBool(i8.includes(2, 1));

const u8 = new Uint8Array([1, 2, 3]);
assertBool(u8.includes(2));
assertBool(u8.includes(2, 1));

const u8c = new Uint8ClampedArray([1, 2, 3]);
assertBool(u8c.includes(2));
assertBool(u8c.includes(2, 1));

const i16 = new Int16Array([1, 2, 3]);
assertBool(i16.includes(2));
assertBool(i16.includes(2, 1));

const u16 = new Uint16Array([1, 2, 3]);
assertBool(u16.includes(2));
assertBool(u16.includes(2, 1));

const i32 = new Int32Array([1, 2, 3]);
assertBool(i32.includes(2));
assertBool(i32.includes(2, 1));

const u32 = new Uint32Array([1, 2, 3]);
assertBool(u32.includes(2));
assertBool(u32.includes(2, 1));

const f32 = new Float32Array([1.5, 2.5, 3.5]);
assertBool(f32.includes(2.5));
assertBool(f32.includes(2.5, 1));

const f64 = new Float64Array([1.5, 2.5, 3.5]);
assertBool(f64.includes(2.5));
assertBool(f64.includes(2.5, 1));

// todo for es6
// const bi64 = new BigInt64Array([BigInt(1), BigInt(2), BigInt(3)]);
// assertBool(bi64.includes(BigInt(2));
// assertBool(bi64.includes(BigInt(2), 1);
//
// const bu64 = new BigUint64Array([BigInt(1), BigInt(2), BigInt(3)]);
// assertBool(bu64.includes(BigInt(2));
// assertBool(bu64.includes(BigInt(2), 1);

// @ts-expect-error
arr.includes();
// @ts-expect-error
arr.includes(1, '2');

// @ts-expect-error
strArr.includes(2);
// @ts-expect-error
strArr.includes('b', true);

// @ts-expect-error
i8.includes('2');
// @ts-expect-error
i8.includes(2, '1');

// @ts-expect-error
u8.includes('2');
// @ts-expect-error
u8.includes(2, true);

// @ts-expect-error
u8c.includes('2');
// @ts-expect-error
u8c.includes(2, {});

// @ts-expect-error
i16.includes('2');
// @ts-expect-error
i16.includes(2, []);

// @ts-expect-error
u16.includes('2');
// @ts-expect-error
u16.includes(2, '');

// @ts-expect-error
i32.includes('2');
// @ts-expect-error
i32.includes(2, undefined, 42);

// @ts-expect-error
u32.includes('2');
// @ts-expect-error
u32.includes(2, 1, 2);

// @ts-expect-error
f32.includes('2.5');
// @ts-expect-error
f32.includes(2.5, '1');

// @ts-expect-error
f64.includes('2.5');
// @ts-expect-error
f64.includes(2.5, []);

// @ts-expect-error
bi64.includes(2);
// // @ts-expect-error
// bi64.includes(2n, '1');
// // @ts-expect-error
// bi64.includes('2n');

// @ts-expect-error
bu64.includes(2);

// // @ts-expect-error
// bu64.includes(2n, []);
// // @ts-expect-error
// bu64.includes('2n');
