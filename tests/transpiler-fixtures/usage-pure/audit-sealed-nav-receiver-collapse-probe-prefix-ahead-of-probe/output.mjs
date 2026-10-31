import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// an effect the source wrote BEFORE the nav runs before the read the probe reproduces: a sequence
// prefix is not part of the guarded value and may not migrate behind it
export let seq = 0;
export const prefixAheadOfProbe = (seq++, (null == _globalThis.window ? void 0 : _self).Array, _Array$of)(1);