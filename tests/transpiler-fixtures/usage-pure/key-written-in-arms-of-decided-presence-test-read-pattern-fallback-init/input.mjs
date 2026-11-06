let patternFallbackInit = Symbol.iterator;
if (typeof Symbol == 'undefined') [patternFallbackInit] = ['@@iterator'];
export const readPatternFallbackInit = receiver => receiver[patternFallbackInit];
