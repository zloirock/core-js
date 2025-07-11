import 'core-js/full';

const rir1: Iterator<number> = Iterator.range(1, 10);
Iterator.range(1, 10, 1);
Iterator.range(1, 10, { step: 1 });
Iterator.range(1, 10, { inclusive: true });
const rir2: Iterator< bigint> = Iterator.range(BigInt(0), BigInt(10), { step: BigInt(2), inclusive: true });

// @ts-expect-error
Iterator.range(0, 10, 'not-a-number');
// @ts-expect-error
Iterator.range(0, 10, { step: BigInt(1) });
// @ts-expect-error
Iterator.range(0, 10, { inclusive: 3 });
// @ts-expect-error
Iterator.range(0, 10, { step: 'smth' });
// @ts-expect-error
Iterator.range(0, 10, { foo: 'bar' });
