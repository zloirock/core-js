// A static read by a bound computed key off a probed `window`: off-window the source throws destructuring
// `undefined`, which unplugin keeps while it binds the ponyfill (the sidecar), while babel binds the ponyfill
// alone and never throws - its debt.
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";

const K = 'of';
const f = ((null == _globalThis.window ? void 0 : Array)[K], _Array$of);

export { f };