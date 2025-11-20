import range from '@core-js/pure/full/iterator/range';

// import Promise from '@core-js/actual/promise/index';
// import $iteratorFull from '@core-js/pure/full/promise/index';
// import $iteratorActual from '@core-js/pure/actual/iterator/index';

const rir1: Iterator<number> = range(1, 10);
range(1, 10, 1);
range(1, 10, { step: 1 });
range(1, 10, { inclusive: true });

// @ts-expect-error
range(0, 10, 'not-a-number');
// @ts-expect-error
range(0, 10, { inclusive: 3 });
// @ts-expect-error
range(0, 10, { step: 'smth' });
// @ts-expect-error
range(0, 10, { foo: 'bar' });
