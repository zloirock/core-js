import arrayFlatMap from '@core-js/pure/full/array/flat-map';
import arrayFlat from '@core-js/pure/full/array/flat';

// todo check return type after fix
arrayFlatMap([1, 2, 3], x => [x, x * 2]);
arrayFlatMap(['a', 'b', 'c'], x => [x, x.toUpperCase()]);
arrayFlatMap([1, 2, 3], x => x > 1 ? [x, x] : []);
arrayFlatMap([1, 2, 3], function (x) { return [this, x]; }, 123);
arrayFlatMap([1, 2, 3], (x, i, arr) => arr);

arrayFlat([[1], [2], [3]]);
arrayFlat([[1], [2], [3]], 2);
arrayFlat([1, [2, [3, [4]]]], 2);
arrayFlat(['a', ['b', ['c']]]);
arrayFlat([1, 2, 3]);
arrayFlat([1, 2, 3], 0);

const arr = [[1, 2], [3, 4], [5, 6]];
arrayFlat(arr);
arrayFlat(arr, 1);
arrayFlat(arr, 2);

const arr2: (number | number[])[] = [1, [2, 3], 4];
arrayFlat(arr2);

const arr3: (string | string[])[] = ['a', ['b', 'c'], 'd'];
arrayFlat(arr3);

arrayFlat([[[[1]]]] as number[][][][], 3);

// @ts-expect-error
arrayFlatMap([1, 2, 3]);
// @ts-expect-error
arrayFlatMap([1, 2, 3], 123);
// @ts-expect-error
arrayFlatMap([1, 2, 3], 'not function');
// @ts-expect-error
arrayFlat([1, 2, 3] as any[], 'not a number');
// @ts-expect-error
arrayFlatMap([1, 2, 3], x => x, 1, 2);
// @ts-expect-error
arrayFlat([1, 2, 3], 1, 2);
