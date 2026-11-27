import "core-js/modules/es.string.repeat";
import "core-js/modules/es.global-this";
import "core-js/modules/es.number.max-safe-integer";
import "core-js/modules/es.number.to-fixed";
// The computed static key runs on the live Number receiver.
let u;
let g = 0;
export const atLeaf = (u = globalThis.window)?.Number[g++, 'MAX_SAFE_INTEGER'].toFixed(2);