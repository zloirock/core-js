// computed-key chain hop on a polyfillable global root: `?.['foo']` is semantically
// equivalent to `?.foo` for non-Symbol keys but exercises a different parser shape that
// must still substitute the leaf and emit the correct guard around the polyfill call
export const a = globalThis?.['foo']?.includes(1);
export const b = Promise?.['foo']?.includes(2);
