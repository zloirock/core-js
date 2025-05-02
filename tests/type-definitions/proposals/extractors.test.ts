import 'core-js/full';

const rscs1: symbol = Symbol.customExtractor;
const rscs2: typeof Symbol.customExtractor = Symbol.customExtractor;

// @ts-expect-error
Symbol['customExtractor'] = Symbol("other");
// @ts-expect-error
const n: number = Symbol.customExtractor;
