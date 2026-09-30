import _Map from "@core-js/pure/actual/map/constructor";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// An object pattern binds the contained object whose slot is subsequently replaced.
const escapedByObjectPatternInit = function () {
  const objPatBox = {
    k: Object
  };
  const {
    taken
  } = {
    taken: objPatBox
  };
  taken.k = _Map;
  const {
      k: _ref
    } = objPatBox,
    fromEntries = _ref === Object ? _Object$fromEntries : _ref.fromEntries;
  return fromEntries;
}();
export { escapedByObjectPatternInit };