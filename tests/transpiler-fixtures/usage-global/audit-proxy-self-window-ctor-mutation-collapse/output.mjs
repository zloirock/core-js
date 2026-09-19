import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A constructor mutation through a redundant proxy-global hop drops the hop in BOTH emitters, matching the
// read-receiver collapse. a RESOLVABLE hop keeps the natural resolution (`globalThis.self.Map` -> `_self.Map`);
// a NON-resolvable hop (`.window`, no pure entry) MUST drop to the pure root - leaving `_globalThis.window.Set`
// raw reads an undefined `.window` off-engine (crash). a MIXED chain drops fully because the non-resolvable hop
// forces it. usage-global keeps the mutation verbatim and injects only the proxy-root side effects
// (`es.global-this` / `web.self`) - a constructor written as the assignment TARGET is a write, not a read,
// so no constructor module is injected.
globalThis.window.Set = function () {};
globalThis.self.Map = function () {};
globalThis.self.window.WeakSet = function () {};