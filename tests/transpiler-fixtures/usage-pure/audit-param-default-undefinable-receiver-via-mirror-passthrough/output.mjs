import _Array$of from "@core-js/pure/actual/array/of";
import _self from "@core-js/pure/actual/self";
// nested mirror, passthrough sibling beside the polyfilled leaf
export function viaMirrorPassthrough({
  Math: {
    floor
  },
  Array: {
    of
  }
} = {
  Math: _self.Math,
  Array: {
    of: _Array$of
  }
}) {
  return [floor, of];
}