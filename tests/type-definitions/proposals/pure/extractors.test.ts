import symbolCustomMatcher from '@core-js/pure/full/symbol/custom-matcher';
import $symbol from '@core-js/pure/full/symbol';

const rscs1: symbol = symbolCustomMatcher;
const rscs2: typeof symbolCustomMatcher = symbolCustomMatcher;

// @ts-expect-error
$symbol['customMatcher'] = $symbol("other");
// @ts-expect-error
const n: number = symbolCustomMatcher;
