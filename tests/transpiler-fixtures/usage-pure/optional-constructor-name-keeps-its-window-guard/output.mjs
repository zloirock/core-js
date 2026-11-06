import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// The constructor exists only on the live branch of the environment probe.
export const name = (null == (null == _globalThis.window ? void 0 : _Map) ? void 0 : _nameMaybeFunction(_Map)) ?? missing();
export const known = _nameMaybeFunction(_Map);