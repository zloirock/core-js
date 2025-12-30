import $customMatcher from '@core-js/pure/full/symbol/custom-matcher';
import $Symbol from '@core-js/pure/full/symbol/index';

const rscs1: symbol = $customMatcher;
const rscs2: typeof $customMatcher = $customMatcher;

// @ts-expect-error
$Symbol['customMatcher'] = $Symbol("other");
// @ts-expect-error
const n: number = $customMatcher;
