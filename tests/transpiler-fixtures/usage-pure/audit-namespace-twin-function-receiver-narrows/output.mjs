import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
function makeArr() {
  return [1, 2, 3];
}
namespace N {
  function makeArr() {
    return 'x';
  }
}
export const r = _atMaybeArray(_ref = makeArr()).call(_ref, 0);