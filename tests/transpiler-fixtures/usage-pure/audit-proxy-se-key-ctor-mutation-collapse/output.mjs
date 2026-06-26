import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// A SE-bearing computed proxy-hop key in a constructor mutation LHS folds the key to its name, drops a
// non-resolvable hop (`window`) to the pure root, AND harvests the buried effect ahead of it:
// `globalThis[(e++, 'window')].Set = fn` -> `(e++, _globalThis).Set = fn`. leaving `_globalThis[(e++, 'window')]`
// raw reads an undefined `.window` off-engine (crash). a RESOLVABLE hop (`.self`) keeps the natural resolution
// + harvest (`(d++, _self).Map`); a NESTED SE key folds through every level. distinct constructors per line.
let e = 0,
  d = 0,
  f = 0,
  g = 0;
(e++, _globalThis).Set = function () {};
(d++, _self).Map = function () {};
(f++, g++, _globalThis).WeakSet = function () {};