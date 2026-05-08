import _Object$entries from "@core-js/pure/actual/object/entries";
// `satisfies` TS wrapper around an SE-tail destructure init: same TS-peel path as `as`,
// must reach the receiver through the wrapper so the flatten fires AND `recordCall()`
// gets lifted as a standalone statement, not silently swallowed by the rewrite
declare function recordCall(): void;
recordCall();
const entries = _Object$entries;
entries({
  a: 1
});