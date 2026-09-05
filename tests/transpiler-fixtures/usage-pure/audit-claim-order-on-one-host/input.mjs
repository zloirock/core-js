// every channel writing into ONE host statement emits in the order its props dispatched: the
// cascade renders the statics and the per-prop route the instance overwrites, and two anchors of
// their own put whichever ran second in front. both orders of the same pair are spelled here
let eff = 0;
let staticFirst;
let instanceSecond;
let instanceFirst;
let staticSecond;
let other;
({ Object: { keys: staticFirst }, Array: { prototype: { at: instanceSecond } } } = (eff += 1, globalThis));
({ Array: { prototype: { at: instanceFirst } }, Object: { keys: staticSecond }, other } = (eff += 1, globalThis));
export const r = [typeof staticFirst, typeof instanceSecond, typeof instanceFirst, typeof staticSecond, typeof other, eff];
