import 'core-js/full';
import padStart from 'core-js/full/string/pad-start';
import padEnd from 'core-js/full/string/pad-end';
import { assertString } from '../../helpers';

const s = 'foo';

assertString(padStart(s, 5));
assertString(padEnd(s, 8));

assertString(s.padStart(5));
assertString(s.padStart(10, '0'));
assertString(s.padEnd(8));
assertString(s.padEnd(4, '-'));

// @ts-expect-error
padStart(s);
// @ts-expect-error
padEnd(s);
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
