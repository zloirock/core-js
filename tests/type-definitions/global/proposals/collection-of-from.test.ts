import 'core-js/full';

const arrEntries: Array<[string, number]> = [['a', 1], ['b', 2]];
const mapFrom: Map<string, string> = Map.from(arrEntries, v => String(v));
const mapFrom2: Map<string, boolean> = Map.from(arrEntries, v => v > 1);
const mapFrom3: Map<string, number> = Map.from(arrEntries);
const mapOf: Map<string, number> = Map.of(['a', 1], ['b', 2]);

const setFrom: Set<string> = Set.from(['a', 'b', 'c']);
const setFrom2: Set<number> = Set.from([1, 2, 3], v => v * 2);
const setFrom3: Set<string> = Set.from(['a', 'b', 'c'], String);
const setOf: Set<number> = Set.of(1, 2, 3);

const ws1 = {};
const ws2 = {};
const wsArr = [ws1, ws2];
const weakSetFrom: WeakSet<{ a?: number }> = WeakSet.from(wsArr);
const weakSetFrom2: WeakSet<object> = WeakSet.from(wsArr, x => x);
const weakSetOf: WeakSet<object> = WeakSet.of(ws1, ws2);

const wmArr: Array<[object, string]> = [[ws1, 'a'], [ws2, 'b']];
const weakMapFrom: WeakMap<object, string> = WeakMap.from(wmArr);
const weakMapFrom2: WeakMap<object, number> = WeakMap.from(wmArr, v => Number(v.length));
const weakMapOf: WeakMap<object, string> = WeakMap.of([ws1, 'a'], [ws2, 'b']);

// @ts-expect-error
Map.from();
// @ts-expect-error
Map.from(123);
// @ts-expect-error
Map.from([1, 2, 3]);
// @ts-expect-error
Map.from(arrEntries, (a, b, c) => a);
// @ts-expect-error
Map.of(1, 2, 3);
// @ts-expect-error
Map.of(['a', 1], [2, 3, 4]);

// @ts-expect-error
Set.from();
// @ts-expect-error
Set.from(123);
// @ts-expect-error
Set.from(['a', 'b'], 42);
// @ts-expect-error
Set.from(['a'], (value, index, extra) => value);
// @ts-expect-error
Set.of(1, 2, {});

// @ts-expect-error
WeakSet.from([1, 2]);
// @ts-expect-error
WeakSet.from('notiterable');
// @ts-expect-error
WeakSet.from(wsArr, 42);
// @ts-expect-error
WeakSet.of(1, 2);
// @ts-expect-error
WeakSet.of('a');
// @ts-expect-error
WeakSet.of({}, 42);

// @ts-expect-error
WeakMap.from([[1, 'a'], [2, 'b']]);
// @ts-expect-error
WeakMap.from([['a', 1]]);
// @ts-expect-error
WeakMap.from(wmArr, (v, k, x) => v);
// @ts-expect-error
WeakMap.of([{}, 'a'], [{}, 'b', 3]);
// @ts-expect-error
WeakMap.of([1, 2]);
// @ts-expect-error
WeakMap.of(['a', 'b']);
