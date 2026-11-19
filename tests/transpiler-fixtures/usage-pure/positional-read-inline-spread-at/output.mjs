import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// every POSITIONAL read of a literal list expands an inline-array spread the same way: the type
// layer's element reads, the call-argument reads a return type follows, the presence of a slot
// value, the proxy-global pairing, a common element type. one method per row, so a row's narrowing
// is attributable to its own read; a spread of a BINDING leaves no static position past it
function pp({
  x
}) {
  return x;
}
const viaPatternParam = pp(...[{
  x: [1]
}]);
_atMaybeArray(viaPatternParam).call(viaPatternParam, 0);
export { viaPatternParam };