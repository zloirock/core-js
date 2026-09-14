import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A run of OPTIONAL hops sharing the environment probe's name (`globalThis?.window?.window?.window`)
// is one source of undefined: under the realm-self-reference assumption every deeper `window` reads
// the same value, so the guard test reads the shortest prefix carrying the probe (`_globalThis.window`)
// and the deeper `?.` are dead text. The claim's own `?.Array?.of` collapses onto the ponyfill inside
// the guarded alternate. A plain first hop, a sequence prefix, the `self` / `window` / alias roots and
// both depths spell the same test - on both legs alike (the unplugin once kept the whole slice).
const g = _globalThis;
let n = 0;
export const a = null == _globalThis.window ? void 0 : _Array$of(1).length;
export const b = null == _globalThis.window ? void 0 : _Array$of(1).length;
export const c = (n++, null == _globalThis.window ? void 0 : _Array$of(1).length);
export const d = null == _self.window ? void 0 : _Array$of(1).length;
export const e = null == window.window ? void 0 : _Array$of(1).length;
export const f = null == g.window ? void 0 : _Array$of(1).length;
export const h = null == _globalThis.window ? void 0 : _Array$from([1]).length;
export { n };