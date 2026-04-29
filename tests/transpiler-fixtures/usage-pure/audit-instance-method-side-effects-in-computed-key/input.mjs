// comma expression in a computed key (`arr[(SE(), "at")](0)`) carries side effects that
// the instance-method rewrite must preserve - only the receiver flows into
// `_at(arr).call(arr, 0)`, so the property subtree's prefix is wrapped at the call site.
// optional-chain variant: side effects land INSIDE the guard branch since native
// `arr?.[(SE(), "at")]` doesn't evaluate the property when arr is nullish - hoisting them
// outside the guard would fire unconditionally and change runtime semantics
export const a = arr[(probe(), "at")](0);
export const b = arr[(probe1(), probe2(), "flat")]();
export const c = arr?.[(probe(), "includes")](42);
