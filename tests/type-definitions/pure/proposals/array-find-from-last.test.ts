import arrayFindLast from '@core-js/pure/full/array/find-last';
import arrayFindLastIndex from '@core-js/pure/full/array/find-last-index';

const res: number | undefined = arrayFindLast([1, 2, 3], v => v > 1);
arrayFindLast([1, 2, 3], (v): v is 2 => v === 2);
arrayFindLast(['a', 'b', 'c'], v => v === 'b');
arrayFindLast(['a', 'b', 'c'], (v): v is 'b' => v === 'b');
arrayFindLastIndex([1, 2, 3], v => v === 2);
const nums: number[] = [1, 2, 3];
const res2: number | undefined = arrayFindLast(nums, (v, i, arr) => v > 1 && arr.length > 0, {});
arrayFindLastIndex(nums, (v, i, arr) => v > 0, {});
const m = ["a", 2, 3] as (string | number)[];
arrayFindLast(m, (v): v is string => typeof v === "string");

// @ts-expect-error
arrayFindLast([1, 2, 3]);
// @ts-expect-error
arrayFindLast([1, 2, 3], 'not function');

// @ts-expect-error
arrayFindLastIndex([1, 2, 3]);
// @ts-expect-error
arrayFindLastIndex([1, 2, 3], 'not function');
