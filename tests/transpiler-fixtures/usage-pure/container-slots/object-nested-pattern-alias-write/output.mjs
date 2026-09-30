import _Map from "@core-js/pure/actual/map/constructor";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
// A nested literal pattern binds an alias that can replace the original constructor slot.
const escapedByNestedPatternLiteral = function () {
  const deepBox = {
    k: Object
  };
  const [{
    q: reBound
  }] = [{
    q: deepBox
  }];
  reBound.k = _Map;
  const {
      k: _ref
    } = deepBox,
    deepRead = _ref === Object ? _Object$getOwnPropertyNames : _ref.getOwnPropertyNames;
  return deepRead;
}();
export { escapedByNestedPatternLiteral };