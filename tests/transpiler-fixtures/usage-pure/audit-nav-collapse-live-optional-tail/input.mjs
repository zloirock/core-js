// Quiet realm tails retain their computed spelling, landing and optional boundaries.
// Effectful realm keys retain the source read and store.
let plainTail, computedTail, nameableKeyTail, liveOptionalTail, vestigialOptionalTail, mixedTail;
let k = 0;

export const plain = (plainTail = globalThis.self.window).Number.MAX_SAFE_INTEGER;
export const computed = (computedTail = globalThis.self[(k++, 'window')]).Number.MIN_SAFE_INTEGER;
export const nameableKey = (nameableKeyTail = globalThis.self['window']).Number.parseFloat('1.5');
export const liveOptional = (liveOptionalTail = globalThis.self.window?.top).Number.EPSILON;
export const vestigialOptional = (vestigialOptionalTail = globalThis.self?.window).Number.MAX_VALUE;
export const mixed = (mixedTail = globalThis.self['window']?.top).Number.MIN_VALUE;
