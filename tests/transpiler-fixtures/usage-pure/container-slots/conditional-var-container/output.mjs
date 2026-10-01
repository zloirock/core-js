import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
// A hoisted container initialized on only one branch keeps the read of its runtime slot.
export function escapingContainer(cond) {
  var _ref;
  if (cond) {
    var late = {
      k: Object
    };
  }
  return _ref = late.k, _ref === Object ? _Object$getOwnPropertyNames({}) : _ref.getOwnPropertyNames({});
}