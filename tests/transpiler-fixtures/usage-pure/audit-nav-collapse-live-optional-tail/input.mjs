// the TAIL a nav collapse does not absorb, in the spellings the source can write it. the hops above
// the collapsed leaf are re-hung on the ponyfill exactly as written: a key the hop-name canon cannot
// take stays computed (respelled by name it would read a different property on a non-identifier
// key), while one it CAN name is the dotted hop in disguise and folds with the run, and every `?.`
// here is vestigial - each hop below it resolves, so the guard drops - which is why the mixed
// spelling reads exactly like its dotted twin. the three resolving tails carry the import claims,
// the rows that stop at an unresolvable hop are pinned by their re-hung spelling instead.
let plainTail, computedTail, nameableKeyTail, liveOptionalTail, vestigialOptionalTail, mixedTail;
let k = 0;

export const plain = (plainTail = globalThis.self.window).Number.MAX_SAFE_INTEGER;
export const computed = (computedTail = globalThis.self[(k++, 'window')]).Number.MIN_SAFE_INTEGER;
export const nameableKey = (nameableKeyTail = globalThis.self['window']).Number.parseFloat('1.5');
export const liveOptional = (liveOptionalTail = globalThis.self.window?.top).Number.EPSILON;
export const vestigialOptional = (vestigialOptionalTail = globalThis.self?.window).Number.MAX_VALUE;
export const mixed = (mixedTail = globalThis.self['window']?.top).Number.MIN_VALUE;
