import _globalThis from "@core-js/pure/actual/global-this";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _self from "@core-js/pure/actual/self";
// A synthesized property beside a custom sibling evaluates a source key effect once.
// A sealed receiver that throws before producing its value does not reach its fallback.
let c7 = 0;
export function viaSealedSeKeyResidualBail({
  getOwnPropertyNames: nb1,
  customK: nb2
} = function (_ref) {
  return {
    getOwnPropertyNames: _Object$getOwnPropertyNames,
    customK: _ref.customK
  };
}((null == _globalThis.window ? void 0 : (c7++, _self)).Object)) {
  return [nb1, nb2];
}
export { c7 };