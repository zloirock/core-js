import $atob from '@core-js/pure/full/atob';

const s: string = $atob("SGVsbG8gd29ybGQ=");

// @ts-expect-error
$atob();
// @ts-expect-error
$atob(123);
// @ts-expect-error
$atob({});
