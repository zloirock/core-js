import $Symbol from '@core-js/pure/full/symbol/index';

const sym: symbol = $Symbol.customMatcher;

// @ts-expect-error
const bad1: string = $Symbol.customMatcher;
// @ts-expect-error
$Symbol.customMatcher = $Symbol('other');
