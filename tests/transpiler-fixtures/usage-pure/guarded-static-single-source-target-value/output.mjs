import _Array$of from "@core-js/pure/actual/array/of";
// A single guarded assignment can overwrite its own source binding.
// Its value remains the original receiver, including when the source is a foreign object.
export function read(source) {
  var _ref;
  let M = source;
  if (!M) M = Array;
  const result = (M = (_ref = M, _ref === Array ? _Array$of : _ref.of), _ref);
  return [M, result === source];
}