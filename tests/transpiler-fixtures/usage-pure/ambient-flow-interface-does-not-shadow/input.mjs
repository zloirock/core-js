// A Flow declaration is erased; the runtime constructor still needs its polyfill.
interface Map {}
export const result = new Map([[1, 2]]).size;
