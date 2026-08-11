// a computed KEY carrying an effect, on a receiver a trailing dispatch collapses: the collapse
// discards the receiver span while the dispatch folds that same effect into its memo, so the
// effect's text is kept by one channel and thrown away by the other. its own polyfills have to
// survive with the text - subsuming them left a raw call in the memo with its import gone.
// a DISTINCT effect call and a DISTINCT consumer per row keep every module attributable
const log = [];
const arr = [1, [2]];
export const viaMemoFold = globalThis[(log.push('a'), 'Map')].name;

// a chain-assign root places the key effect AFTER its assignment, which is the source's own order.
// the emitters differ only in whether the sequence is memoized before the helper reads it - one
// evaluation either way, sidecar-locked
let held;
export const viaChainAssignRoot = (held = globalThis)[(arr.flat().length, 'Set')].size;

// the same effect under consumers that do NOT fold it into a memo: the key effect rides ahead of
// the collapsed binding, and its polyfills survive there too
export const viaPrototypeRead = globalThis[(arr.includes(1), 'WeakMap')].prototype;
export const viaPlainReceiver = arr[(arr.flatMap(x => [x]).length, 'at')](0);

// NEGATIVE: an effect with nothing polyfillable inside it has nothing to keep alive
let n = 0;
export const viaPlainEffect = globalThis[(n++, 'Promise')].name;
export const effects = log;
