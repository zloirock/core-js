// an intermediate MEMBER hop inside a combined chain is a claim of its own: the combine skips that
// hop's dispatch, so re-emitting its source verbatim drops the polyfill with no diagnostic. the hop
// resolves through the same canon a call hop uses and renders as a bare helper read - one evaluation,
// no receiver memo, because a GET binds no `this`.
const arr = [[[1]]];
const k = 'flat';
const effects = [];
const eff = t => { effects.push(t); return t; };
const dyn = String(Math.min(1, 2)) === '1' ? 'length' : 'at';
export const memberHopUnderGetTail = arr.at?.(0).flat.name;
export const memberHopMirrored = arr.flat?.(0).at.name;
export const memberHopUnderCallTail = arr.at?.(0).flat.at(0);
export const computedMemberHop = arr.at?.(0)[k].name;
// a folded computed key on the hop reads AFTER the receiver and BEFORE the hop above it, which is
// what the memo orders - the effects are otherwise emitted in the reverse of source order
export const seKeyHop = arr.at?.(0)[(eff('k'), 'flat')].name;
export const seKeyBothHops = arr.at?.(0)[(eff('k'), 'flat')][(eff('o'), 'name')].at(0);
// NEGATIVE: a hop whose key does not resolve keeps its verbatim source
export const unresolvedKeyHop = arr.at?.(0)[dyn].name;
// NEGATIVE: a non-claim tail builds no combine, so the hop is left to its own dispatch
export const nonClaimTail = arr.at?.(0).flat.call(arr.at(0));
