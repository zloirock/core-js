import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// every route that MOVES a claim's receiver read has to carry the receiver's TYPE with it: the
// rewrite hands the claim a minted name or a folded expression, and the type ladder cannot walk
// either back to the value the source named. one row per such route, each with its OWN receiver -
// a shared one would let any row's escape degrade the others - and `at` throughout, because array
// and string both carry it: a route that dropped the type ships the generic dispatcher here
const flattenMemo = function () {
  const nb = {
    y: [1, 2]
  };
  const {
      y: _ref
    } = nb,
    at = _atMaybeArray(_ref),
    {
      other
    } = _ref;
  return [at, other];
}();
const wrapperElement = function () {
  const nb = {
    y: 'ab'
  };
  const at = _atMaybeString(nb.y);
  return at;
}();
const loopHead = function () {
  const rows = ['ab'];
  let seen;
  for (const _ref2 of rows) {
    const at = _atMaybeString(_ref2);
    seen = at;
  }
  return seen;
}();
// ... and where the receiver is genuinely UNKNOWN the generic dispatcher IS the answer: the catch
// parameter names a thrown value, and the slot fold takes two arms of different families
const catchParam = function () {
  try {
    throw {
      y: 'ab'
    };
  } catch (_ref3) {
    let at = _at(_ref3.y);
    return at;
  }
}();
const crossFamilyFold = function () {
  const nb = {
    y: [1, 2]
  };
  const {
      y: _ref4 = 'ab'
    } = nb,
    at = _at(_ref4),
    {
      other
    } = _ref4;
  return [at, other];
}();
export { flattenMemo, wrapperElement, loopHead, catchParam, crossFamilyFold };