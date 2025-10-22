import 'core-js/full';

const arr = [1, 2, 3, 4, 5];
const objGroup: Partial<Record<'even' | 'odd', number[]>> = Object.groupBy(arr, x => x % 2 === 0 ? 'even' : 'odd');
const mapGroup: Map<'even' | 'odd', number[]> = Map.groupBy(arr, x => x % 2 === 0 ? 'even' : 'odd');
const objGroup2: Partial<Record<string, string[]>> = Object.groupBy(['foo', 'bar', 'baz'], (s, i) => i > 1 ? s[0] : 'x');
const mapGroup2: Map<string, string[]> = Map.groupBy(['foo', 'bar', 'baz'], (s, i) => i > 1 ? s[0] : 'x');

Object.groupBy('test', c => c);
Object.groupBy(new Set([1, 2, 3]), item => item > 2 ? 'big' : 'small');
Object.groupBy([], _ => 'x');

Map.groupBy('hello', c => c.charCodeAt(0));
Map.groupBy(new Set(['a', 'b', 'c']), (x, i) => i);

// @ts-expect-error
Object.groupBy();
// @ts-expect-error
Object.groupBy([1,2,3]);
// @ts-expect-error
Object.groupBy([1,2,3], 123);
// @ts-expect-error
Object.groupBy(123, x => x);
// @ts-expect-error
Object.groupBy([1,2,3], (a, b, c) => a);
// @ts-expect-error
Map.groupBy();
// @ts-expect-error
Map.groupBy([1,2,3]);
// @ts-expect-error
Map.groupBy(123, x => x);
// @ts-expect-error
Map.groupBy([1,2,3], (a, b, c) => a);
