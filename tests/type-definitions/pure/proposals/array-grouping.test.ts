import objectGroupBy from '@core-js/pure/full/object/group-by';
import mapGroupBy from '@core-js/pure/full/map/group-by';
import { CoreJSMapLike } from '../../helpers';

const arr = [1, 2, 3, 4, 5];
const objGroup: Partial<Record<'even' | 'odd', number[]>> = objectGroupBy(arr, x => x % 2 === 0 ? 'even' : 'odd');
const mapGroup: CoreJSMapLike<'even' | 'odd', number[]> = mapGroupBy(arr, x => x % 2 === 0 ? 'even' : 'odd');
const objGroup2: Partial<Record<string, string[]>> = objectGroupBy(['foo', 'bar', 'baz'], (s, i) => i > 1 ? s[0] : 'x');
const mapGroup2: CoreJSMapLike<string, string[]> = mapGroupBy(['foo', 'bar', 'baz'], (s, i) => i > 1 ? s[0] : 'x');

objectGroupBy('test', c => c);
objectGroupBy(new Set([1, 2, 3]), item => item > 2 ? 'big' : 'small');
objectGroupBy([], _ => 'x');

mapGroupBy('hello', c => c.charCodeAt(0));
mapGroupBy(new Set(['a', 'b', 'c']), (x, i) => i);

// @ts-expect-error
objectGroupBy();
// @ts-expect-error
objectGroupBy([1,2,3]);
// @ts-expect-error
objectGroupBy([1,2,3], 123);
// @ts-expect-error
objectGroupBy(123, x => x);
// @ts-expect-error
objectGroupBy([1,2,3], (a, b, c) => a);
// @ts-expect-error
mapGroupBy();
// @ts-expect-error
mapGroupBy([1,2,3]);
// @ts-expect-error
mapGroupBy(123, x => x);
// @ts-expect-error
mapGroupBy([1,2,3], (a, b, c) => a);
