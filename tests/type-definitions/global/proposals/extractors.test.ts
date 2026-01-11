import 'core-js/full';

const rscs1: symbol = Symbol.customMatcher;
const rscs2: typeof Symbol.customMatcher = Symbol.customMatcher;

// @ts-expect-error
Symbol['customMatcher'] = Symbol('other');
// @ts-expect-error
const n: number = Symbol.customMatcher;
