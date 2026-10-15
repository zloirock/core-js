import _Array$of from "@core-js/pure/actual/array/of";
// A guarded default after a native sibling preserves an assignment's value.
// An earlier native default can rebind the source without changing the later read.
export function read(source) {
  var _ref, _ref2;
  let M = source;
  if (!M) M = Array;
  let before, method;
  const result = ({
    before = (M = {}, 6)
  } = (_ref = M, _ref), method = _ref === Array ? _Array$of : (_ref2 = _ref.of) === void 0 ? 9 : _ref2, _ref);
  return [before, method, result === source];
}