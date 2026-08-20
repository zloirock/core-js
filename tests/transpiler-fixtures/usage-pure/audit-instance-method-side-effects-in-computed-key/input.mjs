// a comma expression in a computed key (`arr[(SE(), "at")](0)`) carries side effects the
// instance-method rewrite must preserve: only the receiver flows into the polyfill call, so
// the property subtree's prefix is wrapped at the call site. optional-chain variant lands
// the effects INSIDE the guard branch - native `arr?.[(SE(), "at")]` skips the property when
// arr is nullish, so hoisting them outside the guard would fire unconditionally
export const a = arr[(probe(), "at")](0);
export const b = arr[(probe1(), probe2(), "flat")]();
export const c = arr?.[(probe(), "includes")](42);
