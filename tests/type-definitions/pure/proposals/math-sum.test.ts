import mathSumPrecise from '@core-js/pure/full/math/sum-precise';

function acceptsNumber(x: number) {}

acceptsNumber(mathSumPrecise(0.1, 0.2));
acceptsNumber(mathSumPrecise(1, 2));

// @ts-expect-error
mathSumPrecise('10');

// @ts-expect-error
mathSumPrecise([1, 2]);
