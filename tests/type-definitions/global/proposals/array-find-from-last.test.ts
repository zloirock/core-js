import 'core-js/es';
import findLast from 'core-js/es/array/find-last';
import findLastJS from 'core-js/es/array/find-last.js';
import findLastIndex from 'core-js/es/array/find-last-index';
import findLastIndexJS from 'core-js/es/array/find-last-index.js';
import { assertNumber } from '../../helpers.js';

const resNS1: number | undefined = findLast([1, 2, 3], v => v > 1);
const resNS2: number | undefined = findLastJS([1, 2, 3], v => v > 1);
assertNumber(findLastIndex([1, 2, 3], v => v > 1, {}));
assertNumber(findLastIndexJS([1, 2, 3], v => v > 1, {}));

// @ts-expect-error
findLast([1, 2, 3]);
// @ts-expect-error
findLastJS([1, 2, 3]);
// @ts-expect-error
findLastIndex([1, 2, 3]);
// @ts-expect-error
findLastIndexJS([1, 2, 3]);

const res: number | undefined = [1, 2, 3].findLast(v => v > 1);
[1, 2, 3].findLast((v): v is 2 => v === 2);
['a', 'b', 'c'].findLast(v => v === 'b');
['a', 'b', 'c'].findLast((v): v is 'b' => v === 'b');
[1, 2, 3].findLastIndex(v => v === 2);
const nums: number[] = [1, 2, 3];
const res2: number | undefined = nums.findLast((v, i, arr) => v > 1 && arr.length > 0, {});
nums.findLastIndex((v, i, arr) => v > 0, {});
const m = ['a', 2, 3] as (string | number)[];
m.findLast((v): v is string => typeof v === 'string');
new Int8Array([1, 2, 3]).findLast(v => v > 0);
new Int8Array([1, 2, 3]).findLast((v, i, arr) => v == i && arr instanceof Int8Array);
new Int8Array([1, 2, 3]).findLastIndex(v => v > 0);
new Int8Array([1, 2, 3]).findLast((v): v is 2 => v === 2);
new Uint8Array([1, 2, 3]).findLast(v => v > 0);
new Uint8Array([1, 2, 3]).findLastIndex(v => v < 0);
new Float64Array([1, 2, 3]).findLast(v => v > 1.1);
new Float64Array([1, 2, 3]).findLastIndex(v => v > 100);
// TODO for es6
// (new BigInt64Array([BigInt(1), BigInt(2), BigInt(3)])).findLast(v => v > BigInt(1));
// (new BigInt64Array([BigInt(1), BigInt(2), BigInt(3)])).findLast((v): v is bigint => v === BigInt(2));
// (new BigInt64Array([BigInt(1), BigInt(2), BigInt(3)])).findLastIndex(v => v > BigInt(0));
// (new BigUint64Array([BigInt(1), BigInt(2), BigInt(3)])).findLast(v => v > BigInt(1));
// (new BigUint64Array([BigInt(1), BigInt(2), BigInt(3)])).findLastIndex(v => v > BigInt(0));

// @ts-expect-error
[1, 2, 3].findLast();

// @ts-expect-error
[1, 2, 3].findLast('not function');

// @ts-expect-error
new Int8Array([1, 2, 3]).findLast();

// @ts-expect-error
new Int8Array([1, 2, 3]).findLast('not function');

// @ts-expect-error
new Int8Array([1, 2, 3]).findLast((v: string) => false);

// // @ts-expect-error
// (new BigInt64Array([BigInt(1)])).findLast((v: number) => false);

// @ts-expect-error
[1, 2, 3].findLastIndex();

// @ts-expect-error
new Float64Array([1, 2, 3]).findLastIndex();

// @ts-expect-error
new Uint8Array([1, 2, 3]).findLastIndex('not function');
