let patternFallbackWrite;
patternFallbackWrite = Symbol.iterator;
if (typeof Symbol == 'undefined') [patternFallbackWrite] = ['@@iterator'];
export const readPatternFallbackWrite = receiver => receiver[patternFallbackWrite];
