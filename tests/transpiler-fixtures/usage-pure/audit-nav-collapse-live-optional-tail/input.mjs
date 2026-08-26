// the TAIL a nav collapse does not absorb, in the three spellings the source can write it. the hops
// above the collapsed leaf are re-hung on the ponyfill exactly as written: a computed key stays
// computed (respelled by name it would read a different property on a non-identifier key), and a
// `?.` survives only where the value below it can still short-circuit - over the always-defined
// ponyfill leaf it is vestigial and drops. one claim per row, so a row that stops resolving leaves
// a hole in the import set.
let plainTail, computedTail, liveOptionalTail, vestigialOptionalTail, mixedTail;

export const plain = (plainTail = globalThis.self.window).Number.MAX_SAFE_INTEGER;
export const computed = (computedTail = globalThis.self['window']).Number.MIN_SAFE_INTEGER;
export const liveOptional = (liveOptionalTail = globalThis.self.window?.top).Number.EPSILON;
export const vestigialOptional = (vestigialOptionalTail = globalThis.self?.window).Number.MAX_VALUE;
export const mixed = (mixedTail = globalThis.self['window']?.top).Number.MIN_VALUE;
