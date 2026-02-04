import 'core-js/full';
import escape from 'core-js/full/regexp/escape';
import { assertString } from '../../helpers';

assertString(escape('foo.*+?^${}()|[]\\'));
assertString(RegExp.escape('foo.*+?^${}()|[]\\'));
assertString(RegExp.escape(''));

// @ts-expect-error
escape();

// @ts-expect-error
RegExp.escape();
// @ts-expect-error
RegExp.escape(123);
// @ts-expect-error
RegExp.escape();
// @ts-expect-error
RegExp.escape({});
// @ts-expect-error
RegExp.escape(/abc/);
// @ts-expect-error
RegExp.escape([]);
// @ts-expect-error
const wrong: number = RegExp.escape('boo');
// @ts-expect-error
RegExp.escape('foo', 'bar');
