// the global twin: nothing is memoized here, so the whole decision is which modules the key effect
// and its consumer pull in - the control for the pure side, where the same effect is folded into a
// memo. a DISTINCT effect call and a DISTINCT consumer per row keep every module attributable
const log = [];
const arr = [1, [2]];
export const viaMemoFold = globalThis[(log.push('a'), 'Map')].name;
let held;
export const viaChainAssignRoot = (held = globalThis)[(arr.flat().length, 'Set')].size;

// the same shape under consumers that do NOT fold the effect into a memo
export const viaPrototypeRead = globalThis[(arr.includes(1), 'WeakMap')].prototype;
export const viaPlainReceiver = arr[(arr.flatMap(x => [x]).length, 'at')](0);

// NEGATIVE: an effect with nothing polyfillable inside it has nothing to keep alive
let n = 0;
export const viaPlainEffect = globalThis[(n++, 'Promise')].name;
export const effects = log;
