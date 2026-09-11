import mathF16round from '@core-js/pure/full/math/f16round';

const res: number = mathF16round(1);

// @ts-expect-error
mathF16round('123');
