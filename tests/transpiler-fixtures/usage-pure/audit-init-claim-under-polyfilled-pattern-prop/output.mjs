import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
// a destructure prop that is itself polyfilled owns the PATTERN, not the whole init: the extraction
// re-emits that init, so the claims inside it keep their own rewrites. claiming the entire proxy-rooted
// chain reached every member however far above the navigation, and the inner claim shipped as a native
// read - the instance method left unpolyfilled, the collapsing constructor left as a hop off the global.
export const name = _nameMaybeFunction(_atMaybeArray(_self.Array.prototype));
export const navName = _nameMaybeFunction(_atMaybeArray(_globalThis.Array.prototype));
export const ctorName = _nameMaybeFunction(_Map.prototype.has);
let assigned;
assigned = _nameMaybeFunction(_atMaybeArray(_self.Array.prototype));
export { assigned };

// a PROBED nav keeps its short-circuit: the init channels decline it on purpose (an always-defined
// ponyfill would erase the source read) and defer to the claim channel's guard render. the deferral
// was to NOBODY while the ownership bound also claimed the member over such a nav - the same mark
// suppressed the very visitor it counted on
export const probed = _nameMaybeFunction(null == _globalThis.window ? void 0 : _Map);
export const probedStatic = _nameMaybeFunction(null == _globalThis.window ? void 0 : _Array$of);
// the claim's SE regions are read through `loc` as well as the numeric span - an extraction hands
// this resolver a CLONE, which keeps only the former, and a position-less claim used to stand down
let seq = 0;
export const leadingEffect = _nameMaybeFunction((seq++, seq++, null == _globalThis.window ? void 0 : _Array$of));

// NEGATIVE: a pattern prop with no polyfill of its own leaves the init to the natural rewrite
export const {
  length
} = _atMaybeArray(_self.Array.prototype);
// NEGATIVE: the navigation itself is still owned by the destructure - no double rewrite of the hops
export const of = _Array$of;