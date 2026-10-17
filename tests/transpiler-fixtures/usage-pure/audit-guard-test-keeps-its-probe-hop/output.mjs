import _Array$from from "@core-js/pure/actual/array/from";
import _self from "@core-js/pure/actual/self";
// the guard TEST spells the run it tests: the probe hop stands over the deepest span pure can back
// and keeps the `?.` written on it, because that branch is the one the SOURCE wrote. folded away,
// the test read an always-defined ponyfill and the claim ran where native short-circuits - and the
// store beside it held the realm object instead of what the environment holds
let w, n, s;
export const storedProbeHop = null == (w = _self.window?.Array) ? void 0 : _Array$from([1]);
// ... and a `?.` the landing makes vestigial erases with it: the hop over the landed binding reads
// a value that cannot be absent
export const storedNestedOptional = null == (n = _self.window?.Array) ? void 0 : _Array$from([1]);

// A `?.` above the store tests the same probe even with no optional inside its value.
// Backing `self` changes the base, not the terminal environment value stored in `s`.
export const storedPlainRun = null == (s = _self.window) ? void 0 : _Array$from([1]);
export { w, n, s };