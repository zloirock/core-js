import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// an array-wrapped element several claims read memoizes - but behind an EFFECTFUL predecessor
// nothing may hoist, so the memo takes the SLOT itself: a write the literal performs exactly where
// native evaluates the element, every reader following the declaration. a PURE predecessor keeps
// the leading memo, which is the same question answered the other way
const log = [];
const rows = [[1, 2]];
_pushMaybeArray(log).call(log, 'n');
const _ref = _flatMaybeArray(rows).call(rows);
const behindEffect = _atMaybeArray(_ref);
const [, {
  length: behindLength
}] = [, _ref];
const _ref2 = _flatMaybeArray(rows).call(rows);
const behindPure = _atMaybeArray(_ref2);
const [, {
  length: pureLength
}] = [rows, _ref2];
export const r = [behindEffect(0), behindLength, behindPure(0), pureLength, log.length];