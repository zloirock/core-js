// A stored effectful realm read keeps its computed tail and independent instance dispatch.
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";

var _ref;
let v, g, out, k;

function eff() {}

out = null == (_ref = (
	g = _globalThis,
	v = null == g[(eff(), 'window')] ? void 0 : _self
)) ? void 0 : _nameMaybeFunction(_at(_ref.Promise[k]));

export const read = out;
export const race = (g = _globalThis, v = g[(eff(), 'window')]?.self)?.Promise.race([]);