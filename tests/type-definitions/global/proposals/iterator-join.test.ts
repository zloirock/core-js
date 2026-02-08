import 'core-js/full';
import join from 'core-js/full/iterator/join';
import { assertString } from '../../helpers.js';

declare const it: Iterator<number>;

assertString(join(it, ' '));

// @ts-expect-error
join(it, '+', '_');

assertString(it.join());
assertString(it.join(' '));
assertString(it.join(5));
assertString(it.join(Symbol('x')));
assertString(it.join(undefined));
assertString(it.join(null));

// @ts-expect-error
it.join('+', '_');
// @ts-expect-error
const res7: number = it.join();
