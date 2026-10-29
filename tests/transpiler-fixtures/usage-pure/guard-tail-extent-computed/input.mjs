// A quiet realm key folds with its dotted twin; a key effect keeps the source read.
export const quiet = () => globalThis.window?.self['window'];
export const effectful = () => globalThis.window?.self[(Array.of(3)[0], 'window')];
