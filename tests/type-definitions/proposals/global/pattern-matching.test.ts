import 'core-js/full';
import '@core-js/types';

const sym: symbol = Symbol.customMatcher;

// @ts-expect-error
const bad1: string = Symbol.customMatcher;
// @ts-expect-error
Symbol['customMatcher'] = Symbol("other");
