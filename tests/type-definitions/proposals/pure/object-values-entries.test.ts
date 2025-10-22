import objectValues from '@core-js/pure/full/object/values';
import objectEntries from '@core-js/pure/full/object/entries';

const obj = { a: 1, b: 2 };
const arr = [1, 2, 3];
const strArr = ['a', 'b', 'c'];
const arrLike: ArrayLike<number> = { 0: 10, 1: 20, length: 2 };
const emptyObj = {};

const values1: number[] = objectValues(obj);
const values2: number[] = objectValues(arr);
const values3: string[] = objectValues(strArr);
const values4: number[] = objectValues(arrLike);
const values5: any[] = objectValues(emptyObj);

const entries1: [string, number][] = objectEntries(obj);
const entries2: [string, number][] = objectEntries(arr);
const entries3: [string, string][] = objectEntries(strArr);
const entries4: [string, number][] = objectEntries(arrLike);
const entries5: [string, any][] = objectEntries(emptyObj);

const valuesAnyArr: any[] = objectValues({ foo: 123, bar: "baz" });
const entriesAnyArr: [string, any][] = objectEntries({ foo: 123, bar: "baz" });

// Некорректные вызовы

// @ts-expect-error
objectValues();

// @ts-expect-error
objectEntries();
