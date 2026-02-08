import 'core-js/es';
import sumPrecise from 'core-js/es/math/sum-precise';
import { assertNumber } from '../../helpers.js';

declare const it: Iterable<number>;

assertNumber(sumPrecise(it));

assertNumber(Math.sumPrecise(it));
assertNumber(Math.sumPrecise([1, 2]));

// @ts-expect-error
sumPrecise('10');

// @ts-expect-error
Math.sumPrecise('10');
// @ts-expect-error
Math.sumPrecise(1, 2);

