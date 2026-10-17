let fallbackInit = '@@iterator';
if (typeof Symbol != 'undefined') fallbackInit = Symbol.iterator;
export const readFallbackInit = receiver => receiver[fallbackInit];
