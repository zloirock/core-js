// Quiet optional realm hops retain their existing fold. Effectful keys and optional calls stay live.
// Ordinary optional instance calls keep their own receiver guards.
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";

var _ref;

export const bareDoubleOptional = null == _globalThis.window
	? void 0
	: _flatMaybeArray(_self.Array.prototype).call([2, [3]]);

let oc = 0;
let cb;

export const optionalCallHop = () => (cb = _globalThis.window)?.[(oc++, 'self')]?.().Array;
export { oc };

let c3 = 0;
const galias = _globalThis;
let alk;

export const aliasDoubleOptional = null == (alk = galias.window)
	? void 0
	: _atMaybeArray(alk[(c3++, 'self')].Array.prototype).call([7], 0);

export { c3 };

const holder = { p: { q: [4, [5]] } };

export const ordinaryDoubleOptional = null == (_ref = holder.p?.q)
	? void 0
	: _findLastIndexMaybeArray(_ref).call(_ref, (v) => Array.isArray(v));