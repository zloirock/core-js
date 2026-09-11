// A SE-bearing computed proxy-hop key in a constructor mutation LHS folds the key to its name, drops a
// non-resolvable hop (`window`) to the pure root, AND harvests the buried effect ahead of it:
// `globalThis[(e++, 'window')].Set = fn` -> `(e++, _globalThis).Set = fn`. leaving `_globalThis[(e++, 'window')]`
// raw reads an undefined `.window` off-engine (crash). a RESOLVABLE hop (`.self`) keeps the natural resolution
// + harvest (`(d++, _self).Map`); a NESTED SE key folds through every level. distinct constructors per line.
let e = 0, d = 0, f = 0, g = 0;
globalThis[(e++, 'window')].Set = function () {};
globalThis[(d++, 'self')].Map = function () {};
globalThis[(f++, (g++, 'window'))].WeakSet = function () {};
