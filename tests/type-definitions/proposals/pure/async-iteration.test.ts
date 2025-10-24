import symbolAsyncIterator from '@core-js/pure/full/symbol/async-iterator';
import $symbol from '@core-js/pure/full/symbol';

const sym: symbol = $symbol.asyncIterator;

// @ts-expect-error
const bad1: string = $symbol.asyncIterator;
// @ts-expect-error
$symbol['asyncIterator'] = $symbol("other");
