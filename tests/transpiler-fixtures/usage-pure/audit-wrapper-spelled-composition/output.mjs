import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3, _ref4, _ref5;
// an outer rewrite renders its spans off PEELED nodes, so a grouping paren the source wrote around
// part of a nested rewrite's range has no place in the outer's content. the nested one still has a
// slot there - the same text without that pair - and it must compose into it
const box = {
  list: [[1]]
};
export const wrapperSpelledRoot = null == _globalThis.window ? void 0 : _atMaybeArray(_ref = _Array$of(2)).call(_ref, 0);

// a statement that STARTS with `(` after a token the parser would fuse it into gets a leading `;`
// when its rewrite is queued. once that rewrite composes into an enclosing one it is no longer at
// statement position, and the separator would sit in the middle of an expression
function getArr() {
  return [[1]];
}
export const composedAtStatementStart = null == (_ref2 = (null == (_ref3 = _flatMaybeArray(_ref4 = getArr())?.call(_ref4)) ? void 0 : _flatMapMaybeArray(_ref3)).call(_ref3, x => x)) ? void 0 : _atMaybeArray(_ref2).call(_ref2, 0);

// the wrapper around the root of a plain (non-optional) navigation composes the same way
export const wrapperSpelledPlainRoot = _atMaybeArray(_ref5 = _Array$of(3, 4)).call(_ref5, -1);