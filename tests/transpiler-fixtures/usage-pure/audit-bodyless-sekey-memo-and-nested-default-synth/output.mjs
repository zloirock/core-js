import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
// Bodyless computed-key destructures evaluate the receiver once and extract properties in order.
// Instance parameter defaults retain their receiver-read limits. Nested defaults belong to their
// own receiver slot in declarations, assignments and catch parameters.
const log = [];
const cond = true;
// A bodyless slot evaluates its receiver once, checks object coercibility, converts the computed key,
// extracts the method, then reads residual siblings in source order.
export const a1 = (() => {
  if (cond) var _ref = 1 ? Array.prototype : [],
    _ref2 = _ref,
    m = null == _ref2 ? _ref2[""] : (_pushMaybeArray(log).call(log, 'k'), _findLastMaybeArray(_ref2)),
    {
      other
    } = _ref;
  return [typeof m, typeof other];
})();
export const a2 = (() => {
  if (cond) var _ref3 = null || Array.prototype,
    _ref4 = _ref3,
    m = null == _ref4 ? _ref4[""] : (_pushMaybeArray(log).call(log, 'k'), _flatMapMaybeArray(_ref4)),
    {
      other
    } = _ref3;
  return [typeof m, typeof other];
})();
export const a3 = (() => {
  let i = 0;
  do var _ref5 = (_pushMaybeArray(log).call(log, 't'), Array.prototype),
    _ref6 = _ref5,
    m = null == _ref6 ? _ref6[""] : (_pushMaybeArray(log).call(log, 'k'), _atMaybeArray(_ref6)),
    {
      other
    } = _ref5; while (i++ < 0);
  return [typeof m, typeof other];
})();
// ... and an EFFECTFUL init rides the same memo - one evaluation, where the source ran it
export const a4 = (() => {
  if (cond) var _ref7 = (() => {
      _pushMaybeArray(log).call(log, 'call');
      return Array.prototype;
    })(),
    _ref8 = _ref7,
    m = null == _ref8 ? _ref8[""] : (_pushMaybeArray(log).call(log, 'k'), _flatMaybeArray(_ref8)),
    {
      other
    } = _ref7;
  return [typeof m, typeof other];
})();
// negative: with no SE key and a quiet init the slot keeps its single statement, no memo
export const a5 = (() => {
  if (cond) var at = _atMaybeArray(Array.prototype);
  return typeof at;
})();
// an instance synth slot may spell an OBSERVABLE receiver once - a sole-prop pattern does
export const b1 = (() => {
  function f({
    at
  } = {
    at: _atMaybeArray(Array.prototype)
  }) {
    return at;
  }
  return typeof f();
})();
// negatives: a second slot would read it twice, and a CALL receiver stays out whatever the count
export const b2 = (() => {
  function f({
    at,
    flat
  } = Array.prototype) {
    return [at, flat];
  }
  return f().length;
})();
export const b3 = (() => {
  function f({
    at
  } = getArr()) {
    return at;
  }
  return typeof f();
})();
// a receiver-bearing default ONE LEVEL IN belongs to the default, not to the outer host - the
// host only decides where the residual lives
export const c1 = (() => {
  const {
    inner: {
      at
    } = {
      at: _atMaybeArray([1, 2])
    }
  } = {};
  return typeof at;
})();
export const c2 = (() => {
  const {
    inner: {
      from
    } = {
      from: _Array$from
    }
  } = {};
  return typeof from;
})();
export const c3 = (() => {
  let at;
  ({
    inner: {
      at
    } = {
      at: _atMaybeArray([1, 2])
    }
  } = {});
  return typeof at;
})();
// ... a CATCH parameter binds like a declarator, so the climb has to stop AT it instead of walking
// past into the enclosing function's params - and where its RELOCATION reaches the claim, the fold
// takes over from the mirror: one read of the hop, both arms through the guard, where mirroring the
// default alone left the live arm raw
export const c4 = (() => {
  try {
    throw {};
  } catch ({
    inner: {
      from
    } = {
      from: _Array$from
    }
  }) {
    return typeof from;
  }
})();
export const c5 = (() => {
  try {
    throw {};
  } catch (_ref9) {
    var _ref10;
    let at = _at((_ref10 = _ref9.inner) === void 0 ? [1, 2] : _ref10);
    return typeof at;
  }
})();
export const effects = log;
export const r = [a1, a2, a3, a4, a5, b1, b2, b3, c1, c2, c3, c4, c5];