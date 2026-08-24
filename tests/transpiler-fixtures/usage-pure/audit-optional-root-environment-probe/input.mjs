// an OPTIONAL root does not erase the guard of a deeper environment probe: the inner `?.`'s
// probe (`globalThis`) is defined, but the hop's own READ (`window`) is not backed, and THAT
// value is what the next `?.` tests. the always-defined chain still erases whole
const log = [];
export const v1 = globalThis?.window?.self;
export const v2 = globalThis?.window?.[(log.push("k"), "self")]?.Array.of(7).at(0);
export const v3 = globalThis?.Array?.from;
use(v1, v2, v3, log);
