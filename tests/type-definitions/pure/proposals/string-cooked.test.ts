import stringCooked from '@core-js/pure/full/string/cooked';

const rcooked1: string = stringCooked('foo', 1, 2, 3);
stringCooked(['foo', 'bar'], 1, 2);
stringCooked([]);

// @ts-expect-error
stringCooked(1);
// @ts-expect-error
stringCooked(false);
