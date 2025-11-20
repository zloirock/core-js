import 'core-js/full';

const arr: number[] = [1, 2, 3];
const arrRes: boolean = arr.includes(2);
const arrRes2: boolean = arr.includes(2, 1);

const strArr: string[] = ['a', 'b', 'c'];
const strArrRes: boolean = strArr.includes('b');
const strArrRes2: boolean = strArr.includes('b', 1);

const i8 = new Int8Array([1, 2, 3]);
const i8Res: boolean = i8.includes(2);
const i8Res2: boolean = i8.includes(2, 1);

const u8 = new Uint8Array([1, 2, 3]);
const u8Res: boolean = u8.includes(2);
const u8Res2: boolean = u8.includes(2, 1);

const u8c = new Uint8ClampedArray([1, 2, 3]);
const u8cRes: boolean = u8c.includes(2);
const u8cRes2: boolean = u8c.includes(2, 1);

const i16 = new Int16Array([1, 2, 3]);
const i16Res: boolean = i16.includes(2);
const i16Res2: boolean = i16.includes(2, 1);

const u16 = new Uint16Array([1, 2, 3]);
const u16Res: boolean = u16.includes(2);
const u16Res2: boolean = u16.includes(2, 1);

const i32 = new Int32Array([1, 2, 3]);
const i32Res: boolean = i32.includes(2);
const i32Res2: boolean = i32.includes(2, 1);

const u32 = new Uint32Array([1, 2, 3]);
const u32Res: boolean = u32.includes(2);
const u32Res2: boolean = u32.includes(2, 1);

const f32 = new Float32Array([1.5, 2.5, 3.5]);
const f32Res: boolean = f32.includes(2.5);
const f32Res2: boolean = f32.includes(2.5, 1);

const f64 = new Float64Array([1.5, 2.5, 3.5]);
const f64Res: boolean = f64.includes(2.5);
const f64Res2: boolean = f64.includes(2.5, 1);

// todo for es6
// const bi64 = new BigInt64Array([BigInt(1), BigInt(2), BigInt(3)]);
// const bi64Res: boolean = bi64.includes(BigInt(2));
// const bi64Res2: boolean = bi64.includes(BigInt(2), 1);
//
// const bu64 = new BigUint64Array([BigInt(1), BigInt(2), BigInt(3)]);
// const bu64Res: boolean = bu64.includes(BigInt(2));
// const bu64Res2: boolean = bu64.includes(BigInt(2), 1);

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
