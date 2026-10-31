// Quiet optional realm navigation keeps its probe. Effectful realm keys and nested calls stay live.
const log = [];
export const v1 = globalThis?.window?.self;
export const v2 = globalThis?.window?.[(log.push("k"), "self")]?.Array.of(7).at(0);
export const v3 = globalThis?.Array?.from;
use(v1, v2, v3, log);
