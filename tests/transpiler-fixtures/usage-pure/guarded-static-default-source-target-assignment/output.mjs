import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// A defaulted slot may write the same binding that supplied the pattern.
// Reaching-value analysis terminates and queued guards retain the original receiver.
// In pure output, the bindings split adjacent guarded writes into a comma or separate statements.
export function read(source) {
  var _ref2;
  let M = source;
  if (!M) M = Array;
  let first, tail;
  const _ref = M;
  first = _nameMaybeFunction(_ref);
  M = _ref === Array ? _Array$of : (_ref2 = _ref.of) === void 0 ? 9 : _ref2, tail = _ref === Array ? _Array$from : _ref.from;
  return [first, M, tail];
}