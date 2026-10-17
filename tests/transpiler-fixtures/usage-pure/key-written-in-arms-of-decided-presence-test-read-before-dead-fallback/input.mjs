let laterFallback;
if (typeof Symbol != 'undefined') laterFallback = Symbol.iterator;
export const readBeforeDeadFallback = receiver => receiver[laterFallback];
if (typeof Symbol == 'undefined') laterFallback = '@@iterator';
