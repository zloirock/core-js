import arrayIncludes from '@core-js/pure/full/array/includes';

const arr: number[] = [1, 2, 3];
const arrRes: boolean = arrayIncludes(arr, 2);
const arrRes2: boolean = arrayIncludes(arr, 2, 1);

const strArr: string[] = ['a', 'b', 'c'];
const strArrRes: boolean = arrayIncludes(strArr, 'b');
const strArrRes2: boolean = arrayIncludes(strArr, 'b', 1);

// @ts-expect-error
arrayIncludes();
// @ts-expect-error
arrayIncludes(1, '2');

// @ts-expect-error
arrayIncludes(2);
// @ts-expect-error
arrayIncludes('b', true);
