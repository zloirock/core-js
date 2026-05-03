// `globalThis['globalThis']['Map']` - both intermediate link and leaf are computed keys.
// resolveProxyGlobalRoot must walk through computed-key intermediate links (memberKey resolves
// via resolveKey to 'globalThis'); the outer resolveObjectName extracts leaf 'Map' via
// computed-key resolveKey path. lock: rewrites to _Map polyfill.
const m = new globalThis['globalThis']['Map']();
// also probe template-literal leaf key over a deep proxy chain
const p = new globalThis[`self`][`Promise`]();
export { m, p };
