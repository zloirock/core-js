import 'core-js/es';
import includes from 'core-js/es/iterator/includes';
import { assertBool } from '../../helpers/helpers.js';

declare const it: Iterator<number>;

assertBool(includes(it, 1));
assertBool(includes(it, 1, 2));

// @ts-expect-error
includes(it);
// @ts-expect-error
includes(it, '1');

assertBool(it.includes(1));
assertBool(it.includes(1, 2));
assertBool(Iterator.from([1, 2, 3]).includes(2, 1));

// @ts-expect-error
it.includes();
// @ts-expect-error
it.includes('1');
// @ts-expect-error
it.includes(1, '1');
// @ts-expect-error
const res: number = it.includes(1);
