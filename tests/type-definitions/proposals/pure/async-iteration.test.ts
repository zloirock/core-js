import symbolAsyncIterator from '@core-js/pure/full/symbol/async-iterator';
import $symbol from '@core-js/pure/full/symbol';

const aiter: symbol = symbolAsyncIterator;
const sym: symbol = symbolAsyncIterator;
const s: typeof symbolAsyncIterator = symbolAsyncIterator;

// @ts-expect-error
const bad1: string = symbolAsyncIterator;
// @ts-expect-error
$symbol['asyncIterator'] = $symbol("other");
