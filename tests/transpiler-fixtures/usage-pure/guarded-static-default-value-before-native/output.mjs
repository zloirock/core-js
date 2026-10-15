import _Array$of from "@core-js/pure/actual/array/of";
// A guarded default before a native sibling preserves an assignment's value.
// The default can rebind the source; the remaining pattern still reads the original.
export function read(source) {
  var _ref, _ref2;
  let M = source;
  if (!M) M = Array;
  let method, extra;
  const result = (method = (_ref = M, _ref === Array ? _Array$of : (_ref2 = _ref.of) === void 0 ? (M = {}, 9) : _ref2), {
    extra
  } = _ref, _ref);
  return [method, extra, result === source];
}