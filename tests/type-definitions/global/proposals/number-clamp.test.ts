import 'core-js/full';
import clamp from 'core-js/full/number/clamp';
import { assertNumber } from '../../helpers';

declare const num: number;

assertNumber(num.clamp(0, 100));
assertNumber(clamp(num, 0, 100));

// @ts-expect-error
clamp(num);
// @ts-expect-error
num.clamp();
// @ts-expect-error
num.clamp('1', '2');
