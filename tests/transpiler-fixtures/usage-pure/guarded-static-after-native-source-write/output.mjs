import _Array$of from "@core-js/pure/actual/array/of";
// A native sibling writes the source binding before the static guard runs.
// The guard still reads the original receiver captured by the destructuring assignment.
export function read(source) {
  var _ref;
  let M = source;
  if (!M) M = Array;
  let method;
  ({
    extra: M
  } = (_ref = M, _ref));
  method = _ref === Array ? _Array$of : _ref.of;
  return method;
}