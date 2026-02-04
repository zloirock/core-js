import 'core-js/full';
import range from 'core-js/full/iterator/range';

const res: Iterator<number> = range(1, 10);

// @ts-expect-error
Iterator.range(0, 'not-a-number');

const rir1: Iterator<number> = Iterator.range(1, 10);
Iterator.range(1, 10, 1);
Iterator.range(1, 10, { step: 1 });
Iterator.range(1, 10, { inclusive: true });
// TODO for es6
// const rir2: Iterator< bigint> = Iterator.range(BigInt(0), BigInt(10), { step: BigInt(2), inclusive: true });

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
