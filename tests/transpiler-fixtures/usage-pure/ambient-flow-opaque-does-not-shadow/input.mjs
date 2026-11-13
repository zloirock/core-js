// A Flow declaration is erased; the runtime constructor still needs its polyfill.
opaque type Map = number;
export const result = new Map([[1, 2]]).size;
