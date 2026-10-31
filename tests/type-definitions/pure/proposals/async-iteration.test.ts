import $Symbol from '@core-js/pure/full/symbol/index';

const sym: symbol = $Symbol.asyncIterator;

// @ts-expect-error
const bad1: string = $Symbol.asyncIterator;
// @ts-expect-error
$Symbol['asyncIterator'] = $Symbol('other');
