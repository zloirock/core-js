import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Moving a receiver into a capture or a rewritten expression preserves its inferred type. The later dispatch must use the same
// receiver family as the original source.
const flattenMemo = function () {
  const nb = {
    y: [1, 2]
  };
  const {
      y: _ref
    } = nb,
    at = _atMaybeArray(_ref),
    {
      other
    } = _ref;
  return [at, other];
}();
export { flattenMemo };