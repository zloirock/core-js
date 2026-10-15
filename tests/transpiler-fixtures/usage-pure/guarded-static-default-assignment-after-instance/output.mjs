import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// A queued instance read precedes the static guards of a discarded assignment.
// The live default keeps its claims and source write after the pattern slots retire.
// In pure output, the bindings split adjacent guarded writes into a comma or separate statements.
export function read(source) {
  var _ref, _ref2;
  const effects = [];
  let M = source;
  if (!M) M = Array;
  let first, method, tail;
  first = _nameMaybeFunction(M);
  method = (_ref = M, _ref === Array ? _Array$of : (_ref2 = _ref.of) === void 0 ? (_pushMaybeArray(effects).call(effects, 'default'), M = {}, 9) : _ref2), tail = _ref === Array ? _Array$from : _ref.from;
  return [first, method, tail, effects];
}