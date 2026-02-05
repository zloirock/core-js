import 'core-js/es';
import flatMap from 'core-js/es/array/flat-map';
import flatMapJS from 'core-js/es/array/flat-map.js';
import { assertNumberArray, assertStringArray } from '../../helpers';

assertNumberArray(flatMap([1, 2, 3], x => [x, x * 2]));
assertNumberArray(flatMapJS([1, 2, 3], x => [x, x * 2]));

// @ts-expect-error
flatMap([1, 2, 3]);
// @ts-expect-error
flatMapJS([1, 2, 3]);

assertNumberArray([1, 2, 3].flatMap(x => [x, x * 2]));
assertStringArray(['a', 'b', 'c'].flatMap(x => [x, x.toUpperCase()]));
[1, 2, 3].flatMap(x => x > 1 ? [x, x] : []);
[1, 2, 3].flatMap(function (x) { return [this, x]; }, 123);
[1, 2, 3].flatMap((x, i, arr) => arr);

assertNumberArray([[1], [2], [3]].flat());
const flatted2: (string[] | string)[] = ['a', ['b', ['c']]].flat();
[[1], [2], [3]].flat(2);
[1, [2, [3, [4]]]].flat(2);
[1, 2, 3].flat();
[1, 2, 3].flat(0);

const arr = [[1, 2], [3, 4], [5, 6]];
arr.flat();
arr.flat(1);
arr.flat(2);

const arr2: (number | number[])[] = [1, [2, 3], 4];
arr2.flat();

const arr3: (string | string[])[] = ['a', ['b', 'c'], 'd'];
arr3.flat();

([[[[1]]]] as number[][][][]).flat(3);

// @ts-expect-error
[1, 2, 3].flatMap();
// @ts-expect-error
[1, 2, 3].flatMap(123);
// @ts-expect-error
[1, 2, 3].flatMap('not function');
// @ts-expect-error
([1, 2, 3] as any[]).flat('not a number');
// @ts-expect-error
[1, 2, 3].flatMap(x => x, 1, 2);
// @ts-expect-error
[1, 2, 3].flat(1, 2);
