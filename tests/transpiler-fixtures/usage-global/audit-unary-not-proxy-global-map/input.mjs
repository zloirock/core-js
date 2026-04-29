// `!globalThis.Map` - pure existence check against the proxy global. global-mode polyfill
// injection is triggered by the member access regardless of the surrounding `!` unary
// wrapper, so `es.map.constructor` side-effect import fires before the check reads
// globalThis.Map (at which point the polyfill has already populated it)
if (!globalThis.Map) throw new Error("Map missing");
