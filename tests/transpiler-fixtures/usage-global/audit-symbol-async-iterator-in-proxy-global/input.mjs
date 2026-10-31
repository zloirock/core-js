// non-iterator well-known symbol through a proxy-global (`globalThis.Symbol`). unlike Symbol.iterator
// (which rewrites the whole `in` to is-iterable), Symbol.asyncIterator routes through the symbol/X
// path - but in usage-global the `in` text is kept verbatim either way, so the surviving `globalThis`
// leaf still earns `es.global-this`. parity with audit-symbol-iterator-in-proxy-global.
globalThis.Symbol.asyncIterator in x;
