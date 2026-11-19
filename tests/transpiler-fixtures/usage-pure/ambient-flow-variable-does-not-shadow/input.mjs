// A Flow declaration is erased; the runtime constructor still needs its polyfill.
declare var Map: any;
export const result = new Map([[1, 2]]).size;
