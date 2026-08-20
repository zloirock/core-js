// A proxy-global hop in a NON-assignment mutation target - `delete`, update (`++`), a for-of/in head (the
// canonical `isMemberWriteHost`, not just `=`) - collapses the non-resolvable `window` hop to the pure root
// just like an assignment, else `_globalThis.window` is undefined off-engine (crash on the write). a SE-bearing
// hop key folds to its name + harvests the buried effect here too. distinct constructors per line.
let e = 0;
delete globalThis.window.Set;
globalThis.window.Map++;
for (globalThis.window.WeakSet of [function () {}]) {}
delete globalThis[(e++, 'window')].WeakMap;
// a SEQUENCE-wrapped write host (`(se, globalThis.window).X = v`) has no read-side SE-tail owner:
// the write-target plan peels the sequence tail and collapses the raw hop too, keeping the prefix
// effects ahead of the pure root. a pure discard is droppable, and only the AST leg drops it - the
// text leg re-emits the source prefix it kept, which is the same write to the same slot
(0, globalThis.window).Promise = function () {};
let f = 0;
(f++, globalThis.window).Symbol = function () {};
(f++, globalThis.window).BigInt += 1;
