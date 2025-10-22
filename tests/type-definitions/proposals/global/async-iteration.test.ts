import 'core-js/full';

const aiter: symbol = Symbol.asyncIterator;
const sym: symbol = Symbol.asyncIterator;
const s: typeof Symbol.asyncIterator = Symbol.asyncIterator;

// @ts-expect-error
const bad1: string = Symbol.asyncIterator;
// @ts-expect-error
Symbol['asyncIterator'] = Symbol("other");
