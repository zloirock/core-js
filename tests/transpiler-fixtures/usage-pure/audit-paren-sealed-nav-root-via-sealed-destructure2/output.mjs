import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// the probe rides DESTRUCTURE and INSTANCE spellings of the sealed source too: a static
// prop claim carries it in the extracted binding (throw before ANY binding lands), an
// instance receiver renders the guarded nav INSIDE the helper argument
export const viaSealedDestructure2 = _includesMaybeArray((null == _globalThis.window ? void 0 : _self.window).Array.prototype);