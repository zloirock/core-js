// A constructor mutation through a redundant proxy-global hop drops the hop in BOTH emitters, matching the
// read-receiver collapse. a RESOLVABLE hop keeps the natural resolution (`globalThis.self.Map` -> `_self.Map`);
// a NON-resolvable hop (`.window`, no pure entry) MUST drop to the pure root - leaving `_globalThis.window.Set`
// raw reads an undefined `.window` off-engine (crash). a MIXED chain drops fully because the non-resolvable hop
// forces it. usage-global keeps the mutation verbatim and injects the constructor + proxy-root side effects.
globalThis.window.Set = function () {};
globalThis.self.Map = function () {};
globalThis.self.window.WeakSet = function () {};
