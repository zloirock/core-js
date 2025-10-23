import stringAt from '@core-js/pure/full/string/at';
import arrayAt from '@core-js/pure/full/array/at';

const str = 'hello';
const s1: string | undefined = stringAt(str, 0);
const s2: string | undefined = stringAt(str, -1);

const arr: number[] = [10, 20, 30];
const a1: number | undefined = arrayAt(arr, 1);
const a2: number | undefined = arrayAt(arr, -2);

// @ts-expect-error
stringAt(str);
// @ts-expect-error
stringAt(str, '1');
// @ts-expect-error
stringAt(str, 1, 2);

// @ts-expect-error
arrayAt(arr);
// @ts-expect-error
arrayAt(arr, '1');
// @ts-expect-error
arrayAt(arr, {});
// @ts-expect-error
arrayAt(arr);
// @ts-expect-error
arrayAt(arr, 1, 1);
