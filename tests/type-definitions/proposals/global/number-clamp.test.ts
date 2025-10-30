import 'core-js/full';
import '@core-js/types';

declare const num: number;
const clamped: number = num.clamp(0, 100);

// @ts-expect-error
num.clamp();
// @ts-expect-error
num.clamp('1', '2');
