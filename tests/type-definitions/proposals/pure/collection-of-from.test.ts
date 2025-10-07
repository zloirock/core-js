import mapFrom from '@core-js/pure/full/map/from';
import mapOf from '@core-js/pure/full/map/of';
import setFrom from '@core-js/pure/full/set/from';
import setOf from '@core-js/pure/full/set/of';
import weakMapFrom from '@core-js/pure/full/weak-map/from';
import weakMapOf from '@core-js/pure/full/weak-map/of';
import weakSetFrom from '@core-js/pure/full/weak-set/from';
import weakSetOf from '@core-js/pure/full/weak-set/of';

const rm: Map<number, string> = mapFrom([[1, 'a'], [2, 'b']] as [number, string][]);
const rm2: Map<number, number> = mapFrom([[1, 10], [2, 20]] as [number, number][], (v: number, k: number) => v + k);
mapFrom([[1, 10], [2, 20]] as [number, number][], function (this: { n: number }, v: number) { return v + this.n; }, { n: 2 });
// @ts-expect-error
mapFrom([['a', 1], ['b', 2]], (v: string, k: number) => v);
// @ts-expect-error
mapFrom([1, 2]);
// @ts-expect-error
mapFrom();

mapOf(['a', 1], ['b', 2]);
const rm4: Map<string, number> = mapOf(['a', 1], ['b', 2]);
// @ts-expect-error
mapOf([1, 2, 3]);
// @ts-expect-error
mapOf(1, 2);

const rs1: Set<number> = setFrom([1, 2, 3]);
const rs2: Set<string> = setFrom([1, 2, 3], x => x.toString());
const rs3: Set<[string, number]> = setFrom([['a', 1], ['b', 2]]);
setFrom(['a', 'b'], function (this: { s: string }, value: string) { return value + this.s; }, { s: '-' });
// @ts-expect-error
setFrom([1, 2, 3], (v: string) => v);
// @ts-expect-error
setFrom();

const rso1: Set<number> = setOf(1, 2, 3);
const rso2: Set<string> = setOf('a', 'b', 'c');
// @ts-expect-error
setOf({ 'foo': 'bar' }, 2);

const rwm1: WeakMap<{ a: number }, string> = weakMapFrom([[{ a: 1 }, 'x']] as [{ a: number }, string][]);
const rwm2: WeakMap<object, string> = weakMapFrom([[{}, 1], [{}, 2]] as [object, number][], (v, k) => v.toString());
weakMapFrom([[{}, 1], [{}, 2]] as [object, number][], function (this: { s: string }, v: number) { return this.s + v; }, { s: '-' });
// @ts-expect-error
weakMapFrom([[1, 2], [2, 3]]);
// @ts-expect-error
weakMapFrom([[{}, 1], [{}, 2]], (v: string, k: string) => v);
// @ts-expect-error
weakMapFrom([1, 2]);
// @ts-expect-error
weakMapFrom();

const rwmo1: WeakMap<object, number> = weakMapOf([{}, 2]);
// @ts-expect-error
weakMapOf([1, 2]);
// @ts-expect-error
weakMapOf({});

const rws1: WeakSet<object> = weakSetFrom([{}]);
const rws2: WeakSet<object> = weakSetFrom([{}, {}], x => x);
weakSetFrom([{}], function (this: { s: string }, obj: object) { return obj; }, { s: '-' });
// @ts-expect-error
weakSetFrom([1, 2]);
// @ts-expect-error
weakSetFrom([{}], (v: number) => v);
// @ts-expect-error
weakSetFrom();
// @ts-expect-error
weakSetFrom([{}], x => 'not-an-object');

const rwso1: WeakSet<object> = weakSetOf({});
// @ts-expect-error
weakSetOf(1);
