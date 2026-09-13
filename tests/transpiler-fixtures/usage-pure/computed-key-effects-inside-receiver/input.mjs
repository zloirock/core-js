// A computed key effect folded into a collapsed receiver keeps the polyfills it calls.
// The trailing helper reads that receiver once, so the effect rides its argument without
// a memo. Each row has a distinct effect and consumer; a kept assignment still precedes its key.
const log = [];
const arr = [1, [2]];
export const viaReceiverFold = globalThis[(log.push('a'), 'Map')].name;

// a chain-assign root places the key effect AFTER its assignment, which is the source's own order.
let held;
export const viaChainAssignRoot = (held = globalThis)[(arr.flat().length, 'Set')].size;

// other consumers carry the key effect ahead of the collapsed binding or dispatch;
// the effect keeps its own polyfills there too
export const viaPrototypeRead = globalThis[(arr.includes(1), 'WeakMap')].prototype;
export const viaPlainReceiver = arr[(arr.flatMap(x => [x]).length, 'at')](0);

// NEGATIVE: an effect with nothing polyfillable inside it has nothing to keep alive
let n = 0;
export const viaPlainEffect = globalThis[(n++, 'Promise')].name;
export const effects = log;
