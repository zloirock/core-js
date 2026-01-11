import arrayFilterReject from '@core-js/pure/full/array/filter-reject';

const res: number[] = arrayFilterReject([1, 2, 3], (v, i, arr) => v > 1);
arrayFilterReject(['a', 'b'], (v, i, arr) => v === 'a');
const arr: number[] = [1, 2, 3];
arrayFilterReject(arr, function (v) { return v < 2; }, { foo: true });

// @ts-expect-error
[1, 2, 3].arrayFilterReject((x: string) => false);
