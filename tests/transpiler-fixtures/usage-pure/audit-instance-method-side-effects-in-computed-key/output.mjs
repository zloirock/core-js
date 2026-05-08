import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// comma expression in a computed key (`arr[(SE(), "at")](0)`) carries side effects that
// the instance-method rewrite must preserve - only the receiver flows into
// `_at(arr).call(arr, 0)`, so the property subtree's prefix is wrapped at the call site.
// optional-chain variant: side effects land INSIDE the guard branch since native
// `arr?.[(SE(), "at")]` doesn't evaluate the property when arr is nullish - hoisting them
// outside the guard would fire unconditionally and change runtime semantics
export const a = (probe(), _at(arr).call(arr, 0));
export const b = (probe1(), probe2(), _flatMaybeArray(arr).call(arr));
export const c = arr == null ? void 0 : (probe(), _includes(arr).call(arr, 42));