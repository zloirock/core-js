import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
// A write through a conditional container alias may replace the matching slot of either arm.
const branchEscapeBothArms = function () {
  const armA = {
    k: Object
  };
  const armB = {
    k: Object
  };
  const picked = _globalThis.cond ? armA : armB;
  picked.k = _Map;
  const {
      k: _ref
    } = armA,
    fromA = _ref === Object ? _Object$getOwnPropertyNames : _ref.getOwnPropertyNames;
  const {
      k: _ref2
    } = armB,
    fromB = _ref2 === Object ? _Object$getOwnPropertyDescriptor : _ref2.getOwnPropertyDescriptor;
  return [fromA, fromB];
}();
export { branchEscapeBothArms };