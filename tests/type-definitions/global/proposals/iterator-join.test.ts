import 'core-js/full';

declare const it: Iterator<number>;

const res1: string = it.join();
const res2: string = it.join(' ');
const res3: string = it.join(5);
const res4: string = it.join(Symbol('x'));
const res5: string = it.join(undefined);
const res6: string = it.join(null);

// @ts-expect-error
it.join('+', '_');
// @ts-expect-error
const res7: number = it.join();
