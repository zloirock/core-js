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

const res: AsyncIterator<number> = from([1, 2, 3]);
const res2: AsyncIterator<number> = from(new Set([1, 2, 3]));
from((function* () { yield 3; })());
const res3: AsyncIterator<string> = from('abc');

declare const ain: AsyncIteratorObject<number>;
declare const aio: AsyncIteratorObject<{ x: number }>;
declare const ais: AsyncIteratorObject<string>;
declare const ilb: Iterable<boolean>;
declare const is: Iterator<string>;
declare const itn: Iterator<number>;
declare const ailb: AsyncIterable<boolean>;

from(ain);
from(ilb);
from(ailb);
from(aio);

// @ts-expect-error
from(123);
// @ts-expect-error
from({});
// @ts-expect-error
from();
// @ts-expect-error
from({ next: () => 1 });

const raits: AsyncIterator<string> = toAsync(is);
const raitn: AsyncIterator<number> = toAsync(itn);

const r1: AsyncIterator<number> = drop(ain, 3);
const r2: Promise<boolean> = every(ain, (v: number, i: number) => v > 0);
const r3: AsyncIterator<number> = filter(ain, (v: number, i: number) => v > 0);
const r4: Promise<number> = find(ain, (v: number, i: number) => v > 0);
const r5: AsyncIterator<string> = flatMap(ain, (v: number, i: number) => `${v}`);
const r6: Promise<void> = forEach(ain, (v: number, i: number) => { });
const r7: AsyncIterator<number> = map(ain, (v: number, i: number) => v * 2);
const r8: Promise<number> = reduce(ain, (acc: number, v: number, i: number) => acc + v, 0);
const r9: Promise<boolean> = some(ain, (v: number, i: number) => v > 0);
const r10: AsyncIterator<number> = take(ain, 10);
const r11: Promise<number[]> = toArray(ain);

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

const s0: Promise<string[]> = toArray(ais);
const f0: Promise<string> = find(ais, (v: string, i: number) => v.length === 1);

// @ts-expect-error
map(ais, (v: string, i: number) => v.length === 1, 'extra');
