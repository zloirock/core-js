// optional-chain on the proxy-global link + on the Symbol.iterator access.
// `globalProxyMemberName` unwraps ChainExpression (oxc) / OptionalMemberExpression (babel)
// at each chain link, so `globalThis?.Symbol?.iterator` resolves to 'Symbol' and the
// `in`-check rewrites through the `is-iterable` polyfill (same path as the non-optional case)
globalThis?.Symbol?.iterator in x;
