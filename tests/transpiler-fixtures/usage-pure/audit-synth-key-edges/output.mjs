import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// an UNRESOLVABLE computed key bails the whole synth (later-key-wins would let the raw
// read overwrite a polyfilled sibling, and the key would evaluate twice)
export const f = function ({
  at,
  [window.k]: alias
} = [1, 2]) {
  return [at, alias];
}();
// a `__proto__` pattern key spells COMPUTED-STRING in the synth literal: an own property,
// not the prototype-setter form - the literal keeps its own prototype
export const g = function (_ref = [1, 2]) {
  let {
    __proto__: p
  } = _ref;
  let at = _atMaybeArray(_ref);
  return [p, at];
}();
// a WELL-KNOWN-SYMBOL key through a bound alias joins the synth: the slot renders the
// method lookup (`getIteratorMethod(recv)`), not a raw pure-symbol read
const s = _Symbol$iterator;
export const h = function ({
  at,
  [s]: it
} = (() => {
  var _ref2;
  return _ref2 = [1, 2], {
    at: _atMaybeArray(_ref2),
    [_Symbol$iterator]: _getIteratorMethod(_ref2)
  };
})()) {
  return [at, it];
}();
// a STRING spelling of a symbol's own name is an ordinary property, never the symbol: the
// slot keeps the plain read (reading it through the symbol would substitute a different value)
export const s2 = function ({
  at,
  ["Symbol.iterator"]: x
} = (() => {
  var _ref3;
  return _ref3 = [1, 2], {
    at: _atMaybeArray(_ref3),
    "Symbol.iterator": _ref3["Symbol.iterator"]
  };
})()) {
  return [at, x];
}();
// a FOLDED computed key reads back COMPUTED with its own string, whatever produced the fold:
// a side-effecting key whose prefix stays on the pattern, and a plain string literal
export const s3 = function (_ref4 = void 0) {
  let _ref5 = false;
  let _ref6 = _ref4 === void 0 ? (_ref5 = true, [1, 2]) : _ref4,
    {} = _ref6,
    {
      at
    } = _ref5 ? {
      "at": _atMaybeArray(_ref6)
    } : _ref6,
    {
      [(effect(), "k")]: v
    } = _ref6;
  return [at, v];
}();
export const s4 = function ({
  at,
  ["z"]: z
} = (() => {
  var _ref7;
  return _ref7 = [1, 2], {
    at: _atMaybeArray(_ref7),
    z: _ref7.z
  };
})()) {
  return [at, z];
}();