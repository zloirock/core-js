import 'core-js/full';
import '@core-js/types';

const sym: symbol = Symbol.asyncIterator;

// @ts-expect-error
const bad1: string = Symbol.asyncIterator;
// @ts-expect-error
Symbol['asyncIterator'] = Symbol("other");
