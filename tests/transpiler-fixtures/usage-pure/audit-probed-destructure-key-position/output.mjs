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
  Set: {
    customQ: viaAnchoredFirstA
  },
  Array: {
    of: viaAnchoredFirstB
  }
} = ({} = null == _globalThis.window ? void 0 : _self, {
  Set: _Set,
  Array: {
    of: _Array$of
  }
});
export const {
  Array: {
    of: viaConsumedFirstA
  },
  Set: {
    customQ: viaConsumedFirstB
  }
} = ({} = null == _globalThis.window ? void 0 : _self, {
  Array: {
    of: _Array$of
  },
  Set: _Set
});
export const {
  'Array': {
    of: viaStringKeyFirst
  },
  Set: {
    customQ: viaStringKeySibling
  }
} = ({} = null == _globalThis.window ? void 0 : _self, {
  Array: {
    of: _Array$of
  },
  Set: _Set
});
export const {
  [_Symbol$iterator]: viaSymbolFirst,
  Array: {
    of: viaSymbolSibling
  }
} = ({} = null == _globalThis.window ? void 0 : _self, {
  [_Symbol$iterator]: _getIteratorMethod(_self),
  Array: {
    of: _Array$of
  }
});
export const viaSymbolOnly = _getIteratorMethod(null == _globalThis.window ? void 0 : _self.Array.prototype);