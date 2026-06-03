// `self.Symbol.iterator in x` - `self` proxy-global access to a well-known symbol. usage-pure
// rewrites the whole `in`-check to the is-iterable polyfill, subsuming the `self` leaf (no
// standalone `web.self`). asymmetry counterpart: usage-global keeps the leaf and injects web.self.
self.Symbol.iterator in x;
