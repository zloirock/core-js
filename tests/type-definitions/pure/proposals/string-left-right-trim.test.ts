import stringTrimLeft from '@core-js/pure/full/string/trim-left';
import stringTrimStart from '@core-js/pure/full/string/trim-start';
import stringTrimRight from '@core-js/pure/full/string/trim-right';
import stringTrimEnd from '@core-js/pure/full/string/trim-end';

const s = 'abc';
const t1: string = stringTrimLeft(s);
const t2: string = stringTrimStart(s);
const t3: string = stringTrimRight(s);
const t4: string = stringTrimEnd(s);

// @ts-expect-error
stringTrimLeft(s, 123);

// @ts-expect-error
stringTrimStart(s, 'a');

// @ts-expect-error
stringTrimRight(s, []);

// @ts-expect-error
stringTrimEnd(s, {});

// @ts-expect-error
const n: number = stringTrimLeft(s);
