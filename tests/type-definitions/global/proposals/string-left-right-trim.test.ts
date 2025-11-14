import 'core-js/full';
import '@core-js/types';

const s = 'abc';
const t1: string = s.trimEnd();
const t2: string = s.trimStart();
const t3: string = s.trimLeft();
const t4: string = s.trimRight();

// @ts-expect-error
s.trimEnd(123);

// @ts-expect-error
s.trimStart('a');

// @ts-expect-error
s.trimLeft([]);

// @ts-expect-error
s.trimRight({});

// @ts-expect-error
const n: number = s.trimEnd();
