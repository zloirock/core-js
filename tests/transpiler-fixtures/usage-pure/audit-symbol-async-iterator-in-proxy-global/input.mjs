// non-iterator well-known symbol through a proxy-global. usage-pure rewrites the LHS to the
// `_Symbol$asyncIterator` import (symbol/X path, not is-iterable), subsuming the `globalThis` leaf
// so it does NOT earn a standalone `_globalThis`. asymmetry counterpart: in usage-global the leaf
// survives and is injected (audit-symbol-async-iterator-in-proxy-global).
globalThis.Symbol.asyncIterator in x;
