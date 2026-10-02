import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _self from "@core-js/pure/actual/self";
// A split receiver retains its environment probe and selects a known constructor from its pure import.
// The computed key stays on the tail; its unwritten local binding needs no static namespace.
// The direct static sibling is served independently.
let v, g, out, k;
function eff() {}
out = null == (g = _globalThis, v = null == g[eff(), 'window'] ? void 0 : _self) ? void 0 : _nameMaybeFunction(_at(_Promise[k]));
export const read = out;
export const race = null == (g = _globalThis, v = null == g[eff(), 'window'] ? void 0 : _self) ? void 0 : _Promise$race([]);