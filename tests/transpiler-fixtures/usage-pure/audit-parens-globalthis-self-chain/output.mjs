import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// `(globalThis.self).Array.from` — oxc preserves `ParenthesizedExpression` between
// intermediate proxy-global links. `globalProxyMemberName` must unwrap parens on
// each step so the chain resolves to `Array.from` and gets polyfilled
const r = _Array$from([1, 2, 3]);
_globalThis.__r = r;