import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// parens between intermediate proxy-global links - chain still resolves to Array.from
const r = _Array$from([1, 2, 3]);
_globalThis.__r = r;