function eff() {}
// NEGATIVE: the store holding the PROBE keeps its `?.` - the sequence hands that value on, so the
// optional guards a read that genuinely short-circuits and nothing above it folds
let g5;
export const overProbeStore = (eff(), g5 = globalThis.window)?.self.Array.prototype.at;
