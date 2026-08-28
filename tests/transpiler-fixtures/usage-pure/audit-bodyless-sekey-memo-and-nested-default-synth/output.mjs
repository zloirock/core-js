import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
// four more claims the differential caught the engine DROPPING, all with the fixture
// gate green: a bodyless SE-key sentinel over a receiver only a memo can re-read, the same over
// an EFFECTFUL init the memo evaluates once, an instance synth slot whose receiver is spelled
// exactly once, and a receiver-bearing default one level in - in a declarator, an assignment
// and a catch parameter alike
const log = [];
const cond = true;
// a bodyless slot memoizes whatever the init's shape: the sentinel residual and the extraction
// both read the memo, so a ternary / logical / sequence-tail receiver is re-readable there
export const a1 = (() => {
  if (cond) var _ref = 1 ? Array.prototype : [],
    {
      [(_pushMaybeArray(log).call(log, 'k'), 'findLast')]: _unused,
      other
    } = _ref,
    m = _findLastMaybeArray(_ref);
  return [typeof m, typeof other];
})();
export const a2 = (() => {
  if (cond) var _ref2 = null || Array.prototype,
    {
      [(_pushMaybeArray(log).call(log, 'k'), 'flatMap')]: _unused2,
      other
    } = _ref2,
    m = _flatMapMaybeArray(_ref2);
  return [typeof m, typeof other];
})();
export const a3 = (() => {
  let i = 0;
  do var _ref3 = (_pushMaybeArray(log).call(log, 't'), Array.prototype),
    {
      [(_pushMaybeArray(log).call(log, 'k'), 'at')]: _unused3,
      other
    } = _ref3,
    m = _atMaybeArray(_ref3); while (i++ < 0);
  return [typeof m, typeof other];
})();
// ... and an EFFECTFUL init rides the same memo - one evaluation, where the source ran it
export const a4 = (() => {
  if (cond) var _ref4 = (() => {
      _pushMaybeArray(log).call(log, 'call');
      return Array.prototype;
    })(),
    {
      [(_pushMaybeArray(log).call(log, 'k'), 'flat')]: _unused4,
      other
    } = _ref4,
    m = _flatMaybeArray(_ref4);
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
  } catch (_ref5) {
    var _ref6;
    let at = _at((_ref6 = _ref5.inner) === void 0 ? [1, 2] : _ref6);
    return typeof at;
  }
})();
export const effects = log;
export const r = [a1, a2, a3, a4, a5, b1, b2, b3, c1, c2, c3, c4, c5];