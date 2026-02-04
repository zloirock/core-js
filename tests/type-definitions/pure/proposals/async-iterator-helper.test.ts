import drop from '@core-js/pure/full/async-iterator/drop';
import every from '@core-js/pure/full/async-iterator/every';
import filter from '@core-js/pure/full/async-iterator/filter';
import find from '@core-js/pure/full/async-iterator/find';
import flatMap from '@core-js/pure/full/async-iterator/flat-map';
import forEach from '@core-js/pure/full/async-iterator/for-each';
import from from '@core-js/pure/full/async-iterator/from';
import map from '@core-js/pure/full/async-iterator/map';
import reduce from '@core-js/pure/full/async-iterator/reduce';
import some from '@core-js/pure/full/async-iterator/some';
import take from '@core-js/pure/full/async-iterator/take';
import toArray from '@core-js/pure/full/async-iterator/to-array';
import toAsync from '@core-js/pure/full/iterator/to-async';
import { assertCoreJSAsyncIteratorLike, assertCoreJSPromiseLike } from '../../helpers.pure';

const aitn = from([1]);
assertCoreJSAsyncIteratorLike<number>(aitn);
const aiton = from([1, 2, 3]);
aiton.next();
aiton.toArray();
from(new Set([1, 2, 3]));
from((function * () { yield 3; })());
const aitos = from('abc');

declare const ilb: Iterable<boolean>;
declare const is: Iterator<string>;
declare const itn: Iterator<number>;

from(aiton);
from(ilb);

// @ts-expect-error
from(123);
// @ts-expect-error
from({});
// @ts-expect-error
from();
// @ts-expect-error
from({ next: () => 1 });

const r1 = every(aiton, (v: number, i: number) => v > 0);
assertCoreJSPromiseLike<boolean>(r1);
const r2 = find(aiton, (v: number, i: number) => v > 0);
assertCoreJSPromiseLike<number>(r2);
const r3 = forEach(aiton, (v: number, i: number) => { });
assertCoreJSPromiseLike<void>(r3);
const r4 = reduce(aiton, (acc: number, v: number, i: number) => acc + v, 0);
assertCoreJSPromiseLike<number>(r4);
const r5 = some(aiton, (v: number, i: number) => v > 0);
assertCoreJSPromiseLike<boolean>(r5);
const r6 = toArray(aiton);
assertCoreJSPromiseLike<number[]>(r6);

const ait1 = filter(aiton, (v: number, i: number) => v > 0);
assertCoreJSAsyncIteratorLike<number>(ait1);
const ait2 = flatMap(aiton, (v: number, i: number) => `${ v }`);
assertCoreJSAsyncIteratorLike<string>(ait2);
const ait3 = map(aiton, (v: number, i: number) => v * 2);
assertCoreJSAsyncIteratorLike<number>(ait3);
const ait4 = take(aiton, 10);
assertCoreJSAsyncIteratorLike<number>(ait4);
const ait5 = drop(aiton, 3);
assertCoreJSAsyncIteratorLike<number>(ait5);
const ait6 = toAsync(itn);
assertCoreJSAsyncIteratorLike<number>(ait6);

toAsync(is);

// @ts-expect-error
drop(ain);
// @ts-expect-error
every(ain);
// @ts-expect-error
filter(ain);
// @ts-expect-error
find(ain);
// @ts-expect-error
flatMap(ain);
// @ts-expect-error
forEach(ain);
// @ts-expect-error
map(ain);
// @ts-expect-error
reduce(ain);
// @ts-expect-error
some(ain);
// @ts-expect-error
take(ain);
// @ts-expect-error
toArray(ain, 1);

const s0 = toArray(aiton);
assertCoreJSPromiseLike<number[]>(s0);
const f0 = find(aitos, (v: string, i: number) => v.length === 1);
assertCoreJSPromiseLike<string>(f0);

// @ts-expect-error
map(ais, (v: string, i: number) => v.length === 1, 'extra');
