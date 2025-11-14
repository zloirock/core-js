import f16round from '@core-js/pure/full/math/f16round';

const res: number = f16round(1);

// @ts-expect-error
f16round('123');
