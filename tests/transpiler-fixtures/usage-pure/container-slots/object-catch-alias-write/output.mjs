import _Map from "@core-js/pure/actual/map/constructor";
import _Object$create from "@core-js/pure/actual/object/create";
// A locally caught object is written through the catch alias before its constructor slot is read.
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