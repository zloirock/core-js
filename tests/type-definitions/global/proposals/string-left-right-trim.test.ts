import 'core-js/es';
import trimEnd from 'core-js/es/string/trim-end';
import trimStart from 'core-js/es/string/trim-start';
import trimLeft from 'core-js/es/string/trim-left';
import trimRight from 'core-js/es/string/trim-right';
import { assertString } from '../../helpers.js';

const s = 'abc';

assertString(trimEnd(s));
assertString(trimStart(s));
assertString(trimLeft(s));
assertString(trimRight(s));

assertString(s.trimEnd());
assertString(s.trimStart());
assertString(s.trimLeft());
assertString(s.trimRight());

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
