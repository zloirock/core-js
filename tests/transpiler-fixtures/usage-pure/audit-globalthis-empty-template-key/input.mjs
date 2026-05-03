// computed bracket access on global proxy with an empty template literal: `globalThis[``]`.
// singleQuasiString returns '' (empty cooked); memberKeyName returns ''; globalProxyMemberName
// applies `|| null` to fall through (empty key cannot match any global).
// expectation: this access does NOT polyfill - the empty key is not a real global. used
// downstream in Map.groupBy to confirm the OTHER access still polyfills correctly so we know
// the visitor reached the file.
const x = globalThis[``];

const groups = Map.groupBy([1, 2, 3], n => n % 2);
groups;
x;
