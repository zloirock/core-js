// a PAREN-SEALED lookup closes its own optional chain: `(recv.m?.()?.n)(args)` keeps the whole
// sealed segment in ONE memo - the inner `?.()` renders compact (`_m(recv)?.call(recv)`) and the
// `.call` rides outside the ternary, where the native throw on the void branch lives. splitting
// that segment into two guard disjuncts leaves the second one with no reader.
// the UNSEALED twin has no seal to close, so every optional in the chain hoists into one test.
// sidecar: sealing the inner CALL alone is one memo on both emitters while babel splits it in
// two - an agreed divergence, values identical
const getArr = () => [1, [2]];
export const sealedLookup = (getArr().flat?.()?.flatMap)(x => x);
export const sealedLookupTyped = (getArr().at?.(0)?.toFixed)(2);
export const unsealedTwin = getArr().flat?.()?.flatMap(x => x);
export const sealedInnerCall = (getArr().flat?.())?.flatMap(x => x);
