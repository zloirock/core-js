import 'core-js/es';
import f16round from 'core-js/es/math/f16round';
import { assertNumber } from '../../helpers.js';

assertNumber(f16round(1));
// @ts-expect-error
f16round('123');

assertNumber(Math.f16round(1));

// @ts-expect-error
Math.f16round('123');

const view = new DataView(new ArrayBuffer(4));
view.setFloat16(0, 1.5);
assertNumber(view.getFloat16(0));

// @ts-expect-error
view.setFloat16(0, '123');
// @ts-expect-error
view.getFloat16('123');
// @ts-expect-error
view.getFloat16(0, '123');
// @ts-expect-error
view.setFloat16(0, 1.5, '123');
