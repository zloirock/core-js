import 'core-js/full';
import keysLength from 'core-js/full/object/keys-length';
import { assertNumber } from '../../helpers';

const obj = { a: 1, b: 2 };
const arr = [1, 2, 3];
const strArr = ['a', 'b', 'c'];
const arrLike: ArrayLike<number> = { 0: 10, 1: 20, length: 2 };
const emptyObj = {};
const string = 'abc';

assertNumber(keysLength(obj));
assertNumber(keysLength(arr));
assertNumber(keysLength(strArr));
assertNumber(keysLength(arrLike));
assertNumber(keysLength(emptyObj));
assertNumber(keysLength(string));

assertNumber(Object.keysLength(obj));
assertNumber(Object.keysLength(arr));
assertNumber(Object.keysLength(strArr));
assertNumber(Object.keysLength(arrLike));
assertNumber(Object.keysLength(emptyObj));
assertNumber(Object.keysLength(string));

// @ts-expect-error
keysLength();
// @ts-expect-error
keysLength(null);

// @ts-expect-error
Object.keysLength();
// @ts-expect-error
Object.keysLength(null);
