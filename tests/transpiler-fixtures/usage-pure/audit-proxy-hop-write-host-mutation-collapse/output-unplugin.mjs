import _globalThis from "@core-js/pure/actual/global-this";
// A proxy-global hop in a NON-assignment mutation target - `delete`, update (`++`), a for-of/in head (the
// canonical `isMemberWriteHost`, not just `=`) - collapses the non-resolvable `window` hop to the pure root
// just like an assignment, else `_globalThis.window` is undefined off-engine (crash on the write). a SE-bearing
// hop key folds to its name + harvests the buried effect here too. distinct constructors per line.
let e = 0;
delete _globalThis.Set;
_globalThis.Map++;
for (_globalThis.WeakSet of [function () {}]) {}
delete (e++, _globalThis).WeakMap;
// a SEQUENCE-wrapped write host (`(se, globalThis.window).X = v`) has no read-side SE-tail owner:
// the write-target plan peels the sequence tail and collapses the raw hop too, keeping the prefix
// effects ahead of the pure root (a pure discard is droppable)
(0, _globalThis).Promise = function () {};
let f = 0;
(f++, _globalThis).Symbol = function () {};
(f++, _globalThis).BigInt += 1;