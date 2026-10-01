// `Symbol.iterator in <array>` through the `self` proxy-global. usage-global keeps the `in`
// expression verbatim, so the surviving `self` leaf still earns `web.self`; usage-pure rewrites
// the whole check to is-iterable and the leaf disappears. parity counterpart to the `globalThis`
// proxy-global form, which earns `es.global-this`.
self.Symbol.iterator in [];
