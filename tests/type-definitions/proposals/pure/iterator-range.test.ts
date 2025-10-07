import range from '@core-js/pure/full/iterator/range';

const rir1: Iterator<number> = range(1, 10);
range(1, 10, 1);
range(1, 10, { step: 1 });
range(1, 10, { inclusive: true });
const rir2: Iterator< bigint> = range(BigInt(0), BigInt(10), { step: BigInt(2), inclusive: true });

// @ts-expect-error
range(0, 10, 'not-a-number');
// @ts-expect-error
range(0, 10, { step: BigInt(1) });
// @ts-expect-error
range(0, 10, { inclusive: 3 });
// @ts-expect-error
range(0, 10, { step: 'smth' });
// @ts-expect-error
range(0, 10, { foo: 'bar' });
