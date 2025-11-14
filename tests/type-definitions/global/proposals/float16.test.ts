import 'core-js/full';
import '@core-js/types';

const res: number = Math.f16round(1);

// @ts-expect-error
Math.f16round('123');

const view = new DataView(new ArrayBuffer(4));
view.setFloat16(0, 1.5);
const res2: number = view.getFloat16(0);
// @ts-expect-error
view.setFloat16(0, '123');
// @ts-expect-error
view.getFloat16('123');
// @ts-expect-error
view.getFloat16(0, '123');
// @ts-expect-error
view.setFloat16(0, 1.5, '123');
