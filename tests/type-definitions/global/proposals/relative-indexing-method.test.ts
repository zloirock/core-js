import 'core-js/full';

const str = 'hello';
const s1: string | undefined = str.at(0);
const s2: string | undefined = str.at(-1);

const arr: number[] = [10, 20, 30];
const a1: number | undefined = arr.at(1);
const a2: number | undefined = arr.at(-2);

const roArr: ReadonlyArray<string> = ['a', 'b', 'c'];
const r1: string | undefined = roArr.at(1);
const r2: string | undefined = roArr.at(-3);

const i8 = new Int8Array([5, 6, 7]);
const i8_1: number | undefined = i8.at(2);
const i8_2: number | undefined = i8.at(-1);

const u8 = new Uint8Array([8, 9, 10]);
const u8_1: number | undefined = u8.at(0);

const u8c = new Uint8ClampedArray([15, 16, 17]);
const u8c_1: number | undefined = u8c.at(2);

const i16 = new Int16Array([100, 200, 300]);
const i16_1: number | undefined = i16.at(1);

const u16 = new Uint16Array([400, 500, 600]);
const u16_1: number | undefined = u16.at(-1);

const i32 = new Int32Array([1, 2, 3]);
const i32_1: number | undefined = i32.at(0);

const u32 = new Uint32Array([7, 8, 9]);
const u32_1: number | undefined = u32.at(2);

const f32 = new Float32Array([1.5, 2.5, 3.5]);
const f32_1: number | undefined = f32.at(-1);

const f64 = new Float64Array([11.1, 22.2, 33.3]);
const f64_1: number | undefined = f64.at(0);

// todo for es6
// const bi64 = new (BigInt64Array as { new(arr: ArrayLike<bigint>): BigInt64Array })([BigInt(1), BigInt(2), BigInt(3)]);
// const bi64_1: bigint | undefined = bi64.at(2);
//
// const bu64 = new (BigUint64Array as { new(arr: ArrayLike<bigint>): BigUint64Array })([BigInt(10), BigInt(20)]);
// const bu64_1: bigint | undefined = bu64.at(-1);

// @ts-expect-error
str.at();
// @ts-expect-error
str.at('1');
// @ts-expect-error
str.at(1, 2);

// @ts-expect-error
arr.at();
// @ts-expect-error
arr.at('1');
// @ts-expect-error
arr.at({});
// @ts-expect-error
arr.at();
// @ts-expect-error
arr.at(1, 1);

// @ts-expect-error
roArr.at();
// @ts-expect-error
roArr.at('2');

// @ts-expect-error
i8.at();
// @ts-expect-error
i8.at('0');
// @ts-expect-error
i8.at(1, 2);

// @ts-expect-error
u8.at('0');
// @ts-expect-error
u8.at();

// @ts-expect-error
u8c.at();
// @ts-expect-error
u8c.at({});
// @ts-expect-error
u8c.at('');

// @ts-expect-error
i16.at();
// @ts-expect-error
i16.at([]);

// @ts-expect-error
u16.at(() => 42);

// @ts-expect-error
i32.at(false);

// @ts-expect-error
u32.at(Symbol());

// @ts-expect-error
f32.at('a');

// @ts-expect-error
f64.at([]);

// // @ts-expect-error
// bi64.at('a');
//
// // @ts-expect-error
// bu64.at({});
