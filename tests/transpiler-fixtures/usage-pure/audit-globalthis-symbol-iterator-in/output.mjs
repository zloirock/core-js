import _isIterable from "@core-js/pure/actual/is-iterable";
// `globalThis.Symbol.iterator in x` - proxy-global access to Symbol well-known.
// `asSymbolRef` now accepts MemberExpression via `globalProxyMemberName` chain-walk
// so the `in`-check rewrites through the `Symbol.iterator` polyfill
_isIterable(x);