let laterWrite;
if (typeof Symbol != 'undefined') laterWrite = Symbol.iterator;
export const readBeforeLiveWrite = receiver => receiver[laterWrite];
if (flag) laterWrite = 'values';
