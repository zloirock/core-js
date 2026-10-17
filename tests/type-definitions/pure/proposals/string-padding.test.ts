import stringPadStart from '@core-js/pure/full/string/pad-start';
import stringPadEnd from '@core-js/pure/full/string/pad-end';

const s = 'foo';
const str = '';
const p1: string = stringPadStart(s, 5);
const p2: string = stringPadStart(s, 10, '0');
const p3: string = stringPadEnd(s, 8);
const p4: string = stringPadEnd(s, 4, '-');

// @ts-expect-error
stringPadStart(s);
// @ts-expect-error
stringPadEnd(s);
// @ts-expect-error
stringPadStart(s, '10');
// @ts-expect-error
stringPadEnd(s, true);
// @ts-expect-error
stringPadStart(s, 5, 1);
// @ts-expect-error
stringPadEnd(s, 3, {});
// @ts-expect-error
stringPadStart(s, 2, [], 'extra');
// @ts-expect-error
stringPadEnd(s, 7, '', undefined);
// @ts-expect-error
const n: number = stringPadStart(s, 5);
// @ts-expect-error
const n2: number = stringPadEnd(s, 3, '-');
