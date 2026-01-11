import arrayToReversed from '@core-js/pure/full/array/to-reversed';
import arrayToSorted from '@core-js/pure/full/array/to-sorted';
import arrayToSpliced from '@core-js/pure/full/array/to-spliced';
import arrayWith from '@core-js/pure/full/array/with';

const arr: number[] = [1, 2, 3];
const arrRev: number[] = arrayToReversed(arr);
const arrSorted: number[] = arrayToSorted(arr);
const arrSorted2: number[] = arrayToSorted(arr, (a, b) => b - a);
const arrSpliced: number[] = arrayToSpliced(arr, 1, 1, 4, 5);
const arrSpliced2: number[] = arrayToSpliced(arr, 1);
const arrSpliced3: number[] = arrayToSpliced(arr, 1, 2);
const arrWith: number[] = arrayWith(arr, 1, 42);

const sarr: string[] = ['a', 'b', 'c'];
const sarrRev: string[] = arrayToReversed(sarr);
const sarrSorted: string[] = arrayToSorted(sarr);
const sarrWith: string[] = arrayWith(sarr, 0, 'z');
const sarrSpliced: string[] = arrayToSpliced(sarr, 0, 1);

// @ts-expect-error
arrayToReversed(arr, 1);
// @ts-expect-error
arrayToSorted(arr, 'string');
// @ts-expect-error
arrayToSorted(arr, (a: number, b: string) => 0);
// @ts-expect-error
arrayToSpliced(arr);
// @ts-expect-error
arrayToSpliced(arr, '1', 1);
// @ts-expect-error
arrayToSpliced(arr, 1, '1');
// @ts-expect-error
arrayWith(arr);
// @ts-expect-error
arrayWith(arr, 1);
// @ts-expect-error
arrayWith(arr, '1', 2);

const barr: boolean[] = [true, false];
// @ts-expect-error
arrayToSorted(barr, (a: number, b: number) => 0);
// @ts-expect-error
arrayWith(barr, 0, 1);

const arrStr: string[] = ['a', 'b'];
// @ts-expect-error
arrayWith(arrStr, 0, 1);
