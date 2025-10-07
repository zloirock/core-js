import cooked from '@core-js/pure/full/string/cooked';

const rcooked1: string = cooked('foo', 1, 2, 3);
cooked(['foo', 'bar'], 1, 2);
cooked([]);

// @ts-expect-error
cooked([null]);
// @ts-expect-error
cooked([undefined]);
