import $symbol from '@core-js/pure/full/symbol';

const sym: symbol = $symbol.customMatcher;

// @ts-expect-error
const bad1: string = $symbol.customMatcher;
// @ts-expect-error
$symbol['customMatcher'] = $symbol("other");
