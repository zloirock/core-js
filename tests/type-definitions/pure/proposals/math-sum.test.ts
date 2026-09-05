import mathSumPrecise from '@core-js/pure/full/math/sum-precise';

function acceptsNumber(x: number) {}
declare const it: Iterable<number>;

acceptsNumber(mathSumPrecise(it));
acceptsNumber(mathSumPrecise([1, 2]));

// @ts-expect-error
mathSumPrecise('10');

// @ts-expect-error
mathSumPrecise(1, 2);
