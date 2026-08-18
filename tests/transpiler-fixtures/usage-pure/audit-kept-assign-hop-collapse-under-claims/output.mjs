import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3;
// a KEPT chain-assign VALUE collapses its pony hops whatever claim stands above it: the spelling is
// the value canon (`(k = globalThis.self.window)` stores `_self.window`), which the static claim
// beside these already read through. an instance claim used to leave the hop raw, each emitter for
// its own reason - one had no visitor left for the assignment once the claim subsumed it, the other
// deferred the collapse and then handed its helper a COPY the deferred flush could not match.
let k;
export const instanceCall = _atMaybeArray(_ref = (k = _self.window).Array.prototype).call(_ref, 0);
export const instanceGet = _atMaybeArray((k = _self.window).Array.prototype);
export const vestigialOptional = _atMaybeArray(_ref2 = (k = _self.window).Array.prototype).call(_ref2, 0);
export const name = _nameMaybeFunction(_atMaybeArray(_ref3 = (k = _self.window).Array.prototype).call(_ref3, 0));

// the spelling both emitters already agreed on - the static claim reads the same collapsed value
export const staticClaim = (k = _self.window, _Array$of);
// NEGATIVE: a value navigating a hop with NO ponyfill is not the global - target and value stay as
// written, only the value's own root substitutes
export const unponyfilledHop = (k = null == _globalThis.window ? void 0 : _self).Headers;