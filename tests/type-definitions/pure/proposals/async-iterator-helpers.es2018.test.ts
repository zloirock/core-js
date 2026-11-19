import from from '@core-js/pure/full/async-iterator/from';
import filter from '@core-js/pure/full/async-iterator/filter';
import flatMap from '@core-js/pure/full/async-iterator/flat-map';
import map from '@core-js/pure/full/async-iterator/map';
import take from '@core-js/pure/full/async-iterator/take';
import drop from '@core-js/pure/full/async-iterator/drop';
import toAsync from '@core-js/pure/full/iterator/to-async';

const aitn = from([1]);
for await (const v of aitn) {}

const ait1 = filter(aitn, (v: number, i: number) => v > 0);
for await (const v of ait1) {}

const ait2 = flatMap(aitn, (v: number, i: number) => `${ v }`);
for await (const v of ait2) {}

const ait3 = map(aitn, (v: number, i: number) => v * 2);
for await (const v of ait3) {}

const ait4 = take(aitn, 10);
for await (const v of ait4) {}

const ait5 = drop(aitn, 3);
for await (const v of ait5) {}

declare const itn: Iterator<number>;
const ait6 = toAsync(itn);
for await (const v of ait6) {}
