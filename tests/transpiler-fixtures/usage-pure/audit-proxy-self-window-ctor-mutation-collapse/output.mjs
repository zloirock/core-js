import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A constructor mutation through a redundant proxy-global hop drops the hop in BOTH emitters, matching the
// read-receiver collapse. a RESOLVABLE hop keeps the natural resolution (`globalThis.self.Map` -> `_self.Map`);
// a NON-resolvable hop (`.window`, no pure entry) MUST drop to the pure root - leaving `_globalThis.window.Set`
// raw reads an undefined `.window` off-engine (crash). a MIXED chain drops fully because the non-resolvable hop
// forces it. the pinned constructor import is the mutated-static routing target. distinct constructors per line.
_globalThis.Set = function () {};
_self.Map = function () {};
_globalThis.WeakSet = function () {};