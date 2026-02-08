import mapFrom from '@core-js/pure/full/map/from';
import mapOf from '@core-js/pure/full/map/of';
import setFrom from '@core-js/pure/full/set/from';
import setOf from '@core-js/pure/full/set/of';
import weakMapFrom from '@core-js/pure/full/weak-map/from';
import weakMapOf from '@core-js/pure/full/weak-map/of';
import weakSetFrom from '@core-js/pure/full/weak-set/from';
import weakSetOf from '@core-js/pure/full/weak-set/of';
import { assertCoreJSMapLike, assertCoreJSSetLike, assertCoreJSWeakMapLike, assertCoreJSWeakSetLike } from '../../helpers.pure.js';

const rm = mapFrom([[1, 'a'], [2, 'b']] as [number, string][]);
assertCoreJSMapLike<number, string>(rm);
const rm2 = mapFrom([[1, 10], [2, 20]] as [number, number][], (v: number, k: number) => v + k);
assertCoreJSMapLike<number, number>(rm2);
mapFrom([[1, 10], [2, 20]] as [number, number][], function (this: { n: number }, v: number) { return v + this.n; }, { n: 2 });
// @ts-expect-error
mapFrom([['a', 1], ['b', 2]], (v: string, k: number) => v);
// @ts-expect-error
mapFrom([1, 2]);
// @ts-expect-error
mapFrom();

mapOf(['a', 1], ['b', 2]);
const rm4 = mapOf(['a', 1], ['b', 2]);
assertCoreJSMapLike<string, number>(rm4);
// @ts-expect-error
mapOf([1, 2, 3]);
// @ts-expect-error
mapOf(1, 2);

const rs1 = setFrom([1, 2, 3]);
assertCoreJSSetLike<number>(rs1);
const rs2 = setFrom([1, 2, 3], x => x.toString());
assertCoreJSSetLike<string>(rs2);
const rs3 = setFrom([['a', 1], ['b', 2]]);
assertCoreJSSetLike<(string | number)[]>(rs3);
setFrom(['a', 'b'], function (this: { s: string }, value: string) { return value + this.s; }, { s: '-' });
// @ts-expect-error
setFrom([1, 2, 3], (v: string) => v);
// @ts-expect-error
setFrom();

const rso1 = setOf(1, 2, 3);
assertCoreJSSetLike<number>(rso1);
const rso2 = setOf('a', 'b', 'c');
assertCoreJSSetLike<string>(rso2);
// @ts-expect-error
setOf({ foo: 'bar' }, 2);

const rwm1 = weakMapFrom([[{ a: 1 }, 'x']] as [{ a: number }, string][]);
assertCoreJSWeakMapLike<{ a: number }, string>(rwm1);
const rwm2 = weakMapFrom([[{}, 1], [{}, 2]] as [object, number][], (v, k) => v.toString());
assertCoreJSWeakMapLike<object, string>(rwm2);
weakMapFrom([[{}, 1], [{}, 2]] as [object, number][], function (this: { s: string }, v: number) { return this.s + v; }, { s: '-' });
// @ts-expect-error
weakMapFrom([[1, 2], [2, 3]]);
// @ts-expect-error
weakMapFrom([[{}, 1], [{}, 2]], (v: string, k: string) => v);
// @ts-expect-error
weakMapFrom([1, 2]);
// @ts-expect-error
weakMapFrom();

const rwmo1 = weakMapOf([{}, 2]);
assertCoreJSWeakMapLike<object, number>(rwmo1);
// @ts-expect-error
weakMapOf([1, 2]);
// @ts-expect-error
weakMapOf({});

const rws1 = weakSetFrom([{}]);
assertCoreJSWeakSetLike<object>(rws1);
const rws2 = weakSetFrom([{}, {}], x => x);
assertCoreJSWeakSetLike<object>(rws2);
weakSetFrom([{}], function (this: { s: string }, obj: object) { return obj; }, { s: '-' });
// @ts-expect-error
weakSetFrom([1, 2]);
// @ts-expect-error
weakSetFrom([{}], (v: number) => v);
// @ts-expect-error
weakSetFrom();
// @ts-expect-error
weakSetFrom([{}], x => 'not-an-object');

const rwso1 = weakSetOf({});
assertCoreJSWeakSetLike<object>(rwso1);
// @ts-expect-error
weakSetOf(1);
