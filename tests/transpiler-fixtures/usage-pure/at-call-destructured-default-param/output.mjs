import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A nested parameter default keeps its receiver memo local to that evaluation.
// Supplied properties still bypass the default and its dispatch.
function f({
  a = (() => {
    var _ref;
    return _atMaybeArray(_ref = [1]).call(_ref, 0);
  })()
}) {
  return a;
}