// `const X = X` self-reference: would TDZ at runtime, so the bare-identifier rewrite is
// skipped (would otherwise replace one of the references with `_X` and break TDZ).
// `.try` still polyfills - it goes through the normal member-expression path
const Promise = Promise;
Promise.try(() => 1);
