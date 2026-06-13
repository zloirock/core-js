import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
function makeArr() {
  return [1, 2, 3];
}
namespace N {
  function makeArr() {
    return 'x';
  }
}
export const r = _flatMaybeArray(_ref = makeArr()).call(_ref);