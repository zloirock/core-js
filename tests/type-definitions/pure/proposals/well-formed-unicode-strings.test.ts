import stringIsWellFormed from '@core-js/pure/full/string/is-well-formed';
import stringToWellFormed from '@core-js/pure/full/string/to-well-formed';

const s = 'test';
const b: boolean = stringIsWellFormed(s);
const str: string = stringToWellFormed(s);

// @ts-expect-error
stringIsWellFormed(s, 123);

// @ts-expect-error
stringIsWellFormed(s, 'foo');

// @ts-expect-error
stringToWellFormed(s, []);

// @ts-expect-error
stringToWellFormed(s, true);

// @ts-expect-error
const n: number = stringToWellFormed(s);

// @ts-expect-error
const s2: string = stringIsWellFormed(s);
