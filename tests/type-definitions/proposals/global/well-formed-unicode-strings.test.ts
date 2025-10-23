import 'core-js/full';

const s = 'test';
const b: boolean = s.isWellFormed();
const str: string = s.toWellFormed();

// @ts-expect-error
s.isWellFormed(123);

// @ts-expect-error
s.isWellFormed('foo');

// @ts-expect-error
s.toWellFormed([]);

// @ts-expect-error
s.toWellFormed(true);

// @ts-expect-error
const n: number = s.toWellFormed();

// @ts-expect-error
const s2: string = s.isWellFormed();
