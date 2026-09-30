import _Map from "@core-js/pure/actual/map";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
// An argument selected from an inline array still hands the contained object to the callee.
function consume(first) {
  if (first) first.k = _Map;
}
const escapedInsideArrayLiteral = function () {
  const litBox = {
    k: Object
  };
  consume([litBox][0]);
  const {
      k: _ref
    } = litBox,
    getOwnPropertyNames = _ref === Object ? _Object$getOwnPropertyNames : _ref.getOwnPropertyNames;
  return getOwnPropertyNames;
}();
export { escapedInsideArrayLiteral };