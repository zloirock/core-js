import $symbol from '@core-js/pure/full/symbol/index';

const sym: symbol = $symbol.asyncIterator;

// @ts-expect-error
const bad1: string = $symbol.asyncIterator;
// @ts-expect-error
$symbol['asyncIterator'] = $symbol("other");
