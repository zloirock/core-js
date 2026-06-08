// SE-tail receiver under an optional receiver-access: `(0, globalThis)?.flat(0)`. the `?.` guards
// the whole receiver - if it is nullish, the access is skipped. the SE prefix `0,` stays in source
// verbatim while the tail `globalThis` is substituted by its proxy-global pure-import. `.flat` is
// gated off the global object (an Array.prototype method absent on it), so no instance polyfill emits
(0, globalThis)?.flat(0);
