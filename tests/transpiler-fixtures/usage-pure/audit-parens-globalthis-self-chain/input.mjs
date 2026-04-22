// `(globalThis.self).Array.from` — oxc preserves `ParenthesizedExpression` between
// intermediate proxy-global links. `globalProxyMemberName` must unwrap parens on
// each step so the chain resolves to `Array.from` and gets polyfilled
const r = (globalThis.self).Array.from([1, 2, 3]);
globalThis.__r = r;
