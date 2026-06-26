// A proxy-global hop in a NON-assignment mutation target - `delete`, update (`++`), a for-of/in head (the
// canonical `isMemberWriteHost`, not just `=`) - collapses the non-resolvable `window` hop to the pure root
// just like an assignment, else `_globalThis.window` is undefined off-engine (crash on the write). a SE-bearing
// hop key folds to its name + harvests the buried effect here too. distinct constructors per line.
let e = 0;
delete globalThis.window.Set;
globalThis.window.Map++;
for (globalThis.window.WeakSet of [function () {}]) {}
delete globalThis[(e++, 'window')].WeakMap;
