import _Map from "@core-js/pure/actual/map/constructor";
import _Object$create from "@core-js/pure/actual/object/create";
// A local catch alias writes the held constructor slot before it is read.
// The catch itself hands no constructor out; the written slot still contributes its own family.
const escapedByThrow = function () {
  const thrownBox = {
    k: Object
  };
  try {
    throw thrownBox;
  } catch (caught) {
    caught.k = _Map;
  }
  const {
      k: _ref
    } = thrownBox,
    viaThrow = _ref === Object ? _Object$create : _ref.create;
  return viaThrow;
}();
export { escapedByThrow };