// Chain-assignment receiver `(a = Array).from(...)` must keep the assignment as an observable side effect
// even when the static dispatch drops the receiver in favour of the polyfill import.
// Three shapes cover static-drop, instance-memoize, and plain-literal paths in one fixture.
const r = (a = Array).from([1]);
const s = (b = Map).keys();
const t = [1, 2, 3].includes(2);
[r, s, t];
