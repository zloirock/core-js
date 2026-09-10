// the guard TEST spells the run it tests: the probe hop stands over the deepest span pure can back
// and keeps the `?.` written on it, because that branch is the one the SOURCE wrote. folded away,
// the test read an always-defined ponyfill and the claim ran where native short-circuits - and the
// store beside it held the realm object instead of what the environment holds
let w, n, s;
export const storedProbeHop = (w = globalThis.self.window?.Array)?.from([1]);
// ... and a `?.` the landing makes vestigial erases with it: the hop over the landed binding reads
// a value that cannot be absent
export const storedNestedOptional = (n = globalThis.self?.window?.Array)?.from([1]);

// NEGATIVE: with no `?.` inside the stored value there is no branch to reproduce - the read through
// the store proves the value and the probe folds, the locked store canon
export const storedPlainRun = (s = globalThis.self.window)?.Array.from([1]);
export { w, n, s };
