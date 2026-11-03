import _globalThis from "@core-js/pure/actual/global-this";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _self from "@core-js/pure/actual/self";
// A custom sibling retains its source read beside the synthesized polyfilled property.
// An empty pattern keeps the guarded receiver because coercion can still throw.
export function viaSealedSynthResidualBail({
  groupBy: sn1,
  customK: sn2
} = function (_ref) {
  return null == _ref ? _ref : {
    groupBy: _Object$groupBy,
    get customK() {
      return _ref.customK;
    }
  };
}((null == _globalThis.window ? void 0 : _self.window).Object)) {
  return [sn1, sn2];
}