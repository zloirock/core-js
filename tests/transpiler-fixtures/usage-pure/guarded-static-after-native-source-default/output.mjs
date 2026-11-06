import _Array$of from "@core-js/pure/actual/array/of";
// A native default can rebind the source before an undefaulted static guard.
// Both reads belong to the original receiver, rather than the value installed by the default.
export function read(source) {
  var _ref;
  let M = source;
  if (!M) M = Array;
  const {
      before = (M = {}, 6)
    } = (_ref = M, _ref),
    method = _ref === Array ? _Array$of : _ref.of;
  return [before, method];
}