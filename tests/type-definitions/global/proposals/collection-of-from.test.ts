import 'core-js/full';
import mapFrom from 'core-js/full/map/from';
import mapOf from 'core-js/full/map/of';
import setFrom from 'core-js/full/set/from';
import setOf from 'core-js/full/set/of';
import weakSetFrom from 'core-js/full/weak-set/from';
import weakSetOf from 'core-js/full/weak-set/of';
import weakMapFrom from 'core-js/full/weak-map/from';
import weakMapOf from 'core-js/full/weak-map/of';

const arrEntries: Array<[string, number]> = [['a', 1], ['b', 2]];

const resNS: Map<string, string> = mapFrom(arrEntries, v => String(v));
const resNS2: Map<string, number> = mapOf(['a', 1], ['b', 2]);

const res: Map<string, string> = Map.from(arrEntries, v => String(v));
const res2: Map<string, boolean> = Map.from(arrEntries, v => v > 1);
const res3: Map<string, number> = Map.from(arrEntries);
const res4: Map<string, number> = Map.of(['a', 1], ['b', 2]);

const resNS3: Set<number> = setFrom([1, 2, 3], v => v * 2);
const resNS4: Set<string> = setOf('a', 'b', 'c');

const res5: Set<string> = Set.from(['a', 'b', 'c']);
const res6: Set<number> = Set.from([1, 2, 3], v => v * 2);
const res7: Set<string> = Set.from(['a', 'b', 'c'], String);
const res8: Set<number> = Set.of(1, 2, 3);

const ws1 = {};
const ws2 = {};
const wsArr = [ws1, ws2];

const resNS5: WeakSet<object> = weakSetFrom(wsArr);
const resNS6: WeakSet<object> = weakSetOf(ws1, ws2);

const res9: WeakSet<{ a?: number }> = WeakSet.from(wsArr);
const res10: WeakSet<object> = WeakSet.from(wsArr, x => x);
const res11: WeakSet<object> = WeakSet.of(ws1, ws2);

const wmArr: Array<[object, string]> = [[ws1, 'a'], [ws2, 'b']];

const resNS7: WeakMap<object, string> = weakMapFrom(wmArr);
const resNS8: WeakMap<object, number> = weakMapOf([ws1, 1], [ws2, 2]);

const res12: WeakMap<object, string> = WeakMap.from(wmArr);
const res13: WeakMap<object, number> = WeakMap.from(wmArr, v => Number(v.length));
const res14: WeakMap<object, string> = WeakMap.of([ws1, 'a'], [ws2, 'b']);

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
