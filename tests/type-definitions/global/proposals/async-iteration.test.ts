import 'core-js/full';

const sym: symbol = Symbol.asyncIterator;

// @ts-expect-error
const bad1: string = Symbol.asyncIterator;
// @ts-expect-error
Symbol['asyncIterator'] = Symbol('other');
