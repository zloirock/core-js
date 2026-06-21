import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a comma expression in a computed key (`arr[(SE(), "at")](0)`) carries side effects the
// instance-method rewrite must preserve: only the receiver flows into the polyfill call, so
// the property subtree's prefix is wrapped at the call site. optional-chain variant lands
// the effects INSIDE the guard branch - native `arr?.[(SE(), "at")]` skips the property when
// arr is nullish, so hoisting them outside the guard would fire unconditionally
export const a = (probe(), _at(arr).call(arr, 0));
export const b = (probe1(), probe2(), _flatMaybeArray(arr).call(arr));
export const c = arr == null ? void 0 : (probe(), _includes(arr).call(arr, 42));