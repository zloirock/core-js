let k = 0;
// STACKED computed key-SE: the outer key evaluates AFTER the full inner receiver (ECMA
// receiver-before-key), so the inner rewrite's memo hoists ahead of the outer folded SE
let v;
export const doubleHopKeyStack = (v = globalThis.window)?.self?.self.Map[(k++, 'name')][(k += 10, 'at')](0);
