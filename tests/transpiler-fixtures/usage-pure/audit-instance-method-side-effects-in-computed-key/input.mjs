// SequenceExpression in a computed key (`arr[(SE(), "at")](0)`) carries side effects that
// the instance-method rewrite would silently drop - only the receiver flows into
// `_at(arr).call(arr, 0)`, the property subtree is discarded. preserve SE via wrap.
// optional-chain variant: SE must land INSIDE the guard branch since native `arr?.[(SE(), "at")]`
// doesn't evaluate the property when arr is nullish - hoisting SE outside the guard would
// fire it unconditionally and change runtime semantics
export const a = arr[(probe(), "at")](0);
export const b = arr[(probe1(), probe2(), "flat")]();
export const c = arr?.[(probe(), "includes")](42);
