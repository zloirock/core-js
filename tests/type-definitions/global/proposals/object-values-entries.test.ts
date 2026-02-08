import 'core-js/es';
import values from 'core-js/es/object/values';
import entries from 'core-js/es/object/entries';
import { assertNumberArray, assertStringArray } from '../../helpers.js';

const obj = { a: 1, b: 2 };
const arr = [1, 2, 3];
const strArr = ['a', 'b', 'c'];
const arrLike: ArrayLike<number> = { 0: 10, 1: 20, length: 2 };
const emptyObj = {};

assertNumberArray(values(obj));

assertNumberArray(Object.values(obj));
assertNumberArray(Object.values(arr));
assertStringArray(Object.values(strArr));
assertNumberArray(Object.values(arrLike));
const res: any[] = Object.values(emptyObj);

const entriesNS: [string, number][] = entries(obj);

const entries1: [string, number][] = Object.entries(obj);
const entries2: [string, number][] = Object.entries(arr);
const entries3: [string, string][] = Object.entries(strArr);
const entries4: [string, number][] = Object.entries(arrLike);
const entries5: [string, any][] = Object.entries(emptyObj);

const valuesAnyArr: any[] = Object.values({ foo: 123, bar: 'baz' });
const entriesAnyArr: [string, any][] = Object.entries({ foo: 123, bar: 'baz' });

// @ts-expect-error
values();
// @ts-expect-error
entries();

// @ts-expect-error
Object.values();
// @ts-expect-error
Object.entries();
