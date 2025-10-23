import 'core-js/full';

const s = 'foo';
const p1: string = s.padStart(5);
const p2: string = s.padStart(10, '0');
const p3: string = s.padEnd(8);
const p4: string = s.padEnd(4, '-');

// @ts-expect-error
s.padStart();
// @ts-expect-error
s.padEnd();
// @ts-expect-error
s.padStart('10');
// @ts-expect-error
s.padEnd(true);
// @ts-expect-error
s.padStart(5, 1);
// @ts-expect-error
s.padEnd(3, {});
// @ts-expect-error
s.padStart(2, [], 'extra');
// @ts-expect-error
s.padEnd(7, '', undefined);
// @ts-expect-error
const n: number = s.padStart(5);
// @ts-expect-error
const n2: number = s.padEnd(3, '-');
