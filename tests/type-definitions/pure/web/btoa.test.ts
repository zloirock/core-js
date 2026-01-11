import $btoa from '@core-js/pure/full/btoa';

const s: string = $btoa('SGVsbG8gd29ybGQ=');

// @ts-expect-error
$btoa();
// @ts-expect-error
$btoa(123);
// @ts-expect-error
$btoa({});
