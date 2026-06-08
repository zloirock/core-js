// SE-tail receiver with MULTIPLE leading expressions: `(a(), b(), globalThis).flat?.(0)`. the
// tail `globalThis` is substituted by its proxy-global pure-import while the SE prefix `a(), b()`
// stays verbatim in source order. `.flat` is gated off the global object (an Array.prototype method
// absent on it), so no instance polyfill emits - the receiver keeps the substituted proxy-global
declare const a: () => void;
declare const b: () => void;
(a(), b(), globalThis).flat?.(0);
