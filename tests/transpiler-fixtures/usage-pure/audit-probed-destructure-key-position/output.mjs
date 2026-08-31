import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// pattern-hop (anchored) destructures over an UNDEFINABLE probe nav: the source read throws
// where the probe yields undefined, so every anchored render rides the guard-value spelling
// instead of the always-defined receiver / ctor bindings
// the probe key is POSITION-INDEPENDENT: both property orders reproduce the source's throw,
// and a string-literal / computed `[Symbol.iterator]` first key probes like the dotted one
export const {
  union: viaAnchoredFirstA
} = ((null == _globalThis.window ? void 0 : _self).Set, _Set);
export const viaAnchoredFirstB = _Array$of;
export const viaConsumedFirstA = ((null == _globalThis.window ? void 0 : _self).Array, _Array$of);
export const {
  union: viaConsumedFirstB
} = _Set;
export const viaStringKeyFirst = ((null == _globalThis.window ? void 0 : _self).Array, _Array$of);
export const {
  union: viaStringKeySibling
} = _Set;
export const viaSymbolFirst = ((null == _globalThis.window ? void 0 : _self)[_Symbol$iterator], _getIteratorMethod(_self));
export const viaSymbolSibling = _Array$of;
export const viaSymbolOnly = _getIteratorMethod(null == _globalThis.window ? void 0 : _self.Array.prototype);