import _Map from "@core-js/pure/actual/map/constructor";
import _Object$getOwnPropertySymbols from "@core-js/pure/actual/object/get-own-property-symbols";
// An array pattern binds the contained object whose slot is subsequently replaced.
const escapedByArrayPatternInit = function () {
  const patBox = {
    k: Object
  };
  const [reHomed] = [patBox];
  reHomed.k = _Map;
  const {
      k: _ref
    } = patBox,
    getOwnPropertySymbols = _ref === Object ? _Object$getOwnPropertySymbols : _ref.getOwnPropertySymbols;
  return getOwnPropertySymbols;
}();
export { escapedByArrayPatternInit };