// `const X = X` — same TDZ rationale as let. `createSelfRefVarGuard` skips const so the
// constructor polyfill is NOT emitted; `.try` is still caught through ordinary member-expr
// handling (independent from the identifier-level self-ref path)
const Promise = Promise;
Promise.try(() => 1);
