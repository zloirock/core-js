import $parseFloat from '@core-js/pure/full/parse-float';

const res: number = $parseFloat('123.45');

// @ts-expect-error
$parseFloat(123);
