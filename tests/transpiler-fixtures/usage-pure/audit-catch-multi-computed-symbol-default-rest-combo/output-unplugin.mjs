import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
// catch param destructure mixing two computed Symbol keys (only one synth-swappable)
// + AssignmentPattern default on the synth-swap key + rest gather. plugin orchestrates
// hoisted `_ref2`, an `it` extractor with default fallback, and a residual destructure
// for `Symbol.asyncIterator` + `...rest` - all in one CatchClause
try {} catch (_ref) {
let _ref2, it = (_ref2 = _getIteratorMethod(_ref)) === void 0 ? altIter : _ref2;
let { [_Symbol$iterator]: _unused, [_Symbol$asyncIterator]: ait, ...rest } = _ref;
  it();
  ait;
  rest;
}