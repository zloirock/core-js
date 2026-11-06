import $parseInt from '@core-js/pure/full/parse-int';

const res: number = $parseInt('123');

// @ts-expect-error
$parseInt(123);
