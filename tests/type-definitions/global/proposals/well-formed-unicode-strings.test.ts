import 'core-js/es';
import isWellFormed from 'core-js/es/string/is-well-formed';
import toWellFormed from 'core-js/es/string/to-well-formed';
import { assertBool, assertString } from '../../helpers';

const s = 'test';

assertBool(isWellFormed(s));
assertString(toWellFormed(s));

assertBool(s.isWellFormed());
assertString(s.toWellFormed());

// @ts-expect-error
isWellFormed(123);
// @ts-expect-error
toWellFormed([]);

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
