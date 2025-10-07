import numberClamp from '@core-js/pure/full/number/clamp';

declare const num: number;
const clamped: number = numberClamp(num, 0, 100);

// @ts-expect-error
numberClamp(num);
// @ts-expect-error
numberClamp(num, '1', '2');
