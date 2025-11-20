import 'core-js/full';

const obj = { a: 1, b: 2 };
const arr = [1, 2, 3];
const strArr = ['a', 'b', 'c'];
const arrLike: ArrayLike<number> = { 0: 10, 1: 20, length: 2 };
const emptyObj = {};

const values1: number[] = Object.values(obj);
const values2: number[] = Object.values(arr);
const values3: string[] = Object.values(strArr);
const values4: number[] = Object.values(arrLike);
const values5: any[] = Object.values(emptyObj);

const entries1: [string, number][] = Object.entries(obj);
const entries2: [string, number][] = Object.entries(arr);
const entries3: [string, string][] = Object.entries(strArr);
const entries4: [string, number][] = Object.entries(arrLike);
const entries5: [string, any][] = Object.entries(emptyObj);

const valuesAnyArr: any[] = Object.values({ foo: 123, bar: "baz" });
const entriesAnyArr: [string, any][] = Object.entries({ foo: 123, bar: "baz" });

// @ts-expect-error
Object.values();

// @ts-expect-error
Object.entries();
