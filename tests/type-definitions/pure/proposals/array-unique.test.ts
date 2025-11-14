import arrayUniqueBy from '@core-js/pure/full/array/unique-by';

type Obj = { a: number; b: string };
const arr: Obj[] = [{ a: 1, b: 'x' }, { a: 2, b: 'y' }];
const arrRes: Obj[] = arrayUniqueBy(arr);
const arrRes2: Obj[] = arrayUniqueBy(arr, 'a');
const arrRes3: Obj[] = arrayUniqueBy(arr, obj => obj.b);

const numArr: number[] = [1, 2, 1, 3];
const numArrRes: number[] = arrayUniqueBy(numArr);
const numArrRes2: number[] = arrayUniqueBy(numArr, x => x % 2);

// @ts-expect-error
arrayUniqueBy(123);
// @ts-expect-error
arrayUniqueBy(true);
// @ts-expect-error
arrayUniqueBy({});
// @ts-expect-error
arrayUniqueBy('');

// @ts-expect-error
numarrayUniqueBy(1);
// @ts-expect-error
numarrayUniqueBy({});
// @ts-expect-error
numarrayUniqueBy(true);
