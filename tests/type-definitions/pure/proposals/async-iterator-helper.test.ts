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
import { CoreJSAsyncIteratorLike, CoreJSPromiseAndPromiseLike } from '../../helpers';

const aitn: CoreJSAsyncIteratorLike<number> = from([1]);
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

toAsync(is);
toAsync(itn);

const r1: CoreJSPromiseAndPromiseLike<boolean> = every(aiton, (v: number, i: number) => v > 0);
const r2: CoreJSPromiseAndPromiseLike<number> = find(aiton, (v: number, i: number) => v > 0);
const r3: CoreJSPromiseAndPromiseLike<void> = forEach(aiton, (v: number, i: number) => { });
const r4: CoreJSPromiseAndPromiseLike<number> = reduce(aiton, (acc: number, v: number, i: number) => acc + v, 0);
const r5: CoreJSPromiseAndPromiseLike<boolean> = some(aiton, (v: number, i: number) => v > 0);
const r6: CoreJSPromiseAndPromiseLike<number[]> = toArray(aiton);

const ait1: CoreJSAsyncIteratorLike<number> = filter(aiton, (v: number, i: number) => v > 0);
const ait2: CoreJSAsyncIteratorLike<string> = flatMap(aiton, (v: number, i: number) => `${v}`);
const ait3: CoreJSAsyncIteratorLike<number> = map(aiton, (v: number, i: number) => v * 2);
const ait4: CoreJSAsyncIteratorLike<number> = take(aiton, 10);
const ait5: CoreJSAsyncIteratorLike<number> = drop(aiton, 3);

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

const s0: CoreJSPromiseAndPromiseLike<number[]> = toArray(aiton);
const f0: CoreJSPromiseAndPromiseLike<string> = find(aitos, (v: string, i: number) => v.length === 1);

// @ts-expect-error
map(ais, (v: string, i: number) => v.length === 1, 'extra');
