// `satisfies` TS wrapper around an SE-tail destructure init: same TS-peel path as `as`,
// must reach the receiver through the wrapper so the flatten fires AND `recordCall()`
// gets lifted as a standalone statement, not silently swallowed by the rewrite
declare function recordCall(): void;
const { Object: { entries } } = (recordCall(), globalThis) satisfies any;
entries({ a: 1 });
