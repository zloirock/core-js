import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// A queued instance read is followed by several guarded static declarations.
// The default's method call stays live after the source pattern is split.
// Pure drains may join these declarations or emit them as consecutive statements.
export function read(source) {
  var _ref, _ref2, _ref3;
  let M = source;
  if (!M) M = Array;
  const first = _nameMaybeFunction(M);
  const method = (_ref = M, _ref === Array ? _Array$of : (_ref2 = _ref.of) === void 0 ? (M = {}, _atMaybeArray(_ref3 = [9]).call(_ref3, 0)) : _ref2),
    tail = _ref === Array ? _Array$from : _ref.from;
  return [first, method, tail];
}