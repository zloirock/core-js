import _at from "@core-js/pure/actual/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// `const { at } = globalThis.myArr` keeps the proxy chain as the receiver of `_at(...)`;
// `globalThis` is also polyfilled so the call works on engines lacking it.
const at = _at(_globalThis.myArr);
at(0);